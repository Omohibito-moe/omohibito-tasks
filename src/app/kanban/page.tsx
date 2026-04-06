'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task, Status, Business } from '@/lib/types'
import { BUSINESSES, STATUSES, BUSINESS_COLORS } from '@/lib/types'
import { TaskModal } from '@/components/TaskModal'

const COLUMNS: { status: Status; label: string; color: string }[] = [
  { status: '未着手', label: '未着手', color: '#6B7280' },
  { status: '進行中', label: '進行中', color: '#3B82F6' },
  { status: '完了', label: '完了', color: '#10B981' },
  { status: '保留', label: '保留', color: '#F59E0B' },
]

function TaskCard({ task, onEdit }: { task: Task; onEdit: (t: Task) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const bizColor = BUSINESS_COLORS[task.business as keyof typeof BUSINESS_COLORS] ?? '#6B7280'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="card p-3 cursor-grab active:cursor-grabbing select-none hover:shadow-md transition-shadow"
      onClick={() => onEdit(task)}
    >
      <p className="text-sm font-medium leading-snug mb-2" style={{ color: 'var(--text)' }}>
        {task.name}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="business-badge" style={{ backgroundColor: bizColor + '22', color: bizColor }}>
          {task.business}
        </span>
        {task.assignee && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{task.assignee}</span>
        )}
        {task.deadline && (
          <span className="text-xs font-medium ml-auto" style={{ color: '#C9A96E' }}>{task.deadline}</span>
        )}
      </div>
      {task.notes && (
        <p className="text-xs mt-1.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{task.notes}</p>
      )}
    </div>
  )
}

function Column({
  status, label, color, tasks, onEdit, onAdd,
}: {
  status: Status; label: string; color: string; tasks: Task[]
  onEdit: (t: Task) => void; onAdd: (s: Status) => void
}) {
  return (
    <div className="kanban-col flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{label}</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: color + '22', color }}>
            {tasks.length}
          </span>
        </div>
        <button onClick={() => onAdd(status)} className="text-xs px-2 py-0.5 rounded hover:opacity-80" style={{ backgroundColor: color + '22', color }}>＋</button>
      </div>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 flex flex-col gap-2 p-2 rounded-xl min-h-[200px]" style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}>
          {tasks.map(task => <TaskCard key={task.id} task={task} onEdit={onEdit} />)}
        </div>
      </SortableContext>
    </div>
  )
}

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filterBiz, setFilterBiz] = useState<Business | ''>('')
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [modalTask, setModalTask] = useState<Partial<Task> | null>(null)
  const [addStatus, setAddStatus] = useState<Status>('未着手')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const fetchTasks = useCallback(async () => {
    const params = new URLSearchParams({ level: '小タスク' })
    if (filterBiz) params.set('business', filterBiz)
    const res = await fetch(`/api/tasks?${params}`)
    setTasks(await res.json())
  }, [filterBiz])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const handleDragStart = (e: DragStartEvent) => setDraggingId(e.active.id as number)

  const handleDragEnd = async (e: DragEndEvent) => {
    setDraggingId(null)
    const { active, over } = e
    if (!over || active.id === over.id) return
    const targetTask = tasks.find(t => t.id === over.id)
    if (!targetTask) return
    const dragging = tasks.find(t => t.id === active.id)
    if (!dragging || dragging.status === targetTask.status) return
    setTasks(prev => prev.map(t => t.id === active.id ? { ...t, status: targetTask.status } : t))
    await fetch(`/api/tasks/${active.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: targetTask.status }),
    })
  }

  const handleSave = async (data: Partial<Task>) => {
    if (data.id) {
      await fetch(`/api/tasks/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, status: addStatus, level: '小タスク' }),
      })
    }
    setModalTask(null)
    await fetchTasks()
  }

  const draggingTask = draggingId ? tasks.find(t => t.id === draggingId) : null

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold wa-border pl-3" style={{ color: 'var(--text)' }}>カンバン</h1>
          <p className="text-sm mt-0.5 pl-3" style={{ color: 'var(--text-muted)' }}>ドラッグ&ドロップでステータスを変更</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterBiz}
            onChange={e => setFilterBiz(e.target.value as Business | '')}
            className="px-3 py-1.5 rounded-lg border text-sm"
            style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
          >
            <option value="">すべての事業</option>
            {BUSINESSES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <button
            onClick={() => { setModalTask({}); setAddStatus('未着手') }}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: '#1F4E79' }}
          >
            ＋ タスク追加
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {COLUMNS.map(col => (
            <Column
              key={col.status}
              {...col}
              tasks={tasks.filter(t => t.status === col.status)}
              onEdit={t => setModalTask(t)}
              onAdd={s => { setModalTask({}); setAddStatus(s) }}
            />
          ))}
        </div>
        <DragOverlay>
          {draggingTask && (
            <div className="card p-3 shadow-2xl rotate-2">
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{draggingTask.name}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {modalTask && (
        <TaskModal
          task={modalTask.id ? (modalTask as Task) : undefined}
          defaultBusiness={(filterBiz as Business) || 'コンシェルジュ'}
          onClose={() => setModalTask(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
