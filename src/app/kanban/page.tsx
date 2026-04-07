'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task, Status, Business } from '@/lib/types'
import { BUSINESSES, STATUSES, BUSINESS_COLORS, STATUS_COLORS } from '@/lib/types'
import { TaskModal } from '@/components/TaskModal'
import { CompleteToast } from '@/components/CompleteToast'
import { useConfetti } from '@/hooks/useConfetti'

type ViewMode = 'kanban' | 'tree' | 'today'
type SortKey = 'default' | 'deadline' | 'level'
const LEVEL_ORDER: Record<string, number> = { '大タスク': 0, '中タスク': 1, '小タスク': 2 }

function sortTasks(tasks: Task[], sortKey: SortKey, sortAsc: boolean): Task[] {
  if (sortKey === 'default') return tasks
  return [...tasks].sort((a, b) => {
    if (sortKey === 'deadline') {
      const da = a.deadline ?? '9999'
      const db = b.deadline ?? '9999'
      return sortAsc ? da.localeCompare(db) : db.localeCompare(da)
    }
    if (sortKey === 'level') {
      const la = LEVEL_ORDER[a.level] ?? 3
      const lb = LEVEL_ORDER[b.level] ?? 3
      return sortAsc ? la - lb : lb - la
    }
    return 0
  })
}

// ───────────────────────────────────────────────
// カンバン用コンポーネント
// ───────────────────────────────────────────────
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
        <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: 'var(--text-muted)' }}>
          {task.level === '大タスク' ? '大' : task.level === '中タスク' ? '中' : '小'}
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

function Column({ status, label, color, tasks, onEdit, onAdd }: {
  status: Status; label: string; color: string; tasks: Task[]
  onEdit: (t: Task) => void; onAdd: (s: Status) => void
}) {
  const { setNodeRef: setDropRef } = useDroppable({ id: status })
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
        <div ref={setDropRef} className="flex-1 flex flex-col gap-2 p-2 rounded-xl min-h-[200px]" style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}>
          {tasks.map(task => <TaskCard key={task.id} task={task} onEdit={onEdit} />)}
        </div>
      </SortableContext>
    </div>
  )
}

// ───────────────────────────────────────────────
// ツリービュー
// ───────────────────────────────────────────────
function TreeView({ allTasks, onEdit }: { allTasks: Task[]; onEdit: (t: Task) => void }) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  const toggle = (id: number) =>
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const bigTasks = allTasks.filter(t => t.level === '大タスク')
  const midTasks = allTasks.filter(t => t.level === '中タスク')
  const smallTasks = allTasks.filter(t => t.level === '小タスク')

  return (
    <div className="card overflow-hidden flex-1 overflow-y-auto">
      {bigTasks.length === 0 && (
        <p className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>タスクがありません</p>
      )}
      {bigTasks.map(big => {
        const mids = midTasks.filter(m => m.parent_id === big.id)
        const bigOpen = expandedIds.has(big.id)
        const bizColor = BUSINESS_COLORS[big.business as keyof typeof BUSINESS_COLORS] ?? '#6B7280'
        return (
          <div key={big.id} style={{ borderBottom: '1px solid var(--border)' }}>
            {/* 大タスク */}
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:opacity-80 select-none"
              onClick={() => toggle(big.id)}
              style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
            >
              <span className="text-xs w-4 text-center" style={{ color: 'var(--text-muted)' }}>{bigOpen ? '▼' : '▶'}</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: bizColor + '22', color: bizColor }}>大</span>
              <span className="text-sm font-semibold flex-1" style={{ color: 'var(--text)' }}>{big.name}</span>
              <span className={`status-badge ${STATUS_COLORS[big.status]}`}>{big.status}</span>
              {big.deadline && <span className="text-xs font-medium" style={{ color: '#C9A96E' }}>{big.deadline}</span>}
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{mids.length}件</span>
            </div>

            {bigOpen && mids.map(mid => {
              const smalls = smallTasks.filter(s => s.parent_id === mid.id)
              const midOpen = expandedIds.has(mid.id)
              return (
                <div key={mid.id}>
                  {/* 中タスク */}
                  <div
                    className="flex items-center gap-3 py-2.5 cursor-pointer hover:opacity-80 select-none"
                    style={{ paddingLeft: '2.5rem', paddingRight: '1rem', borderTop: '1px solid var(--border)' }}
                    onClick={() => toggle(mid.id)}
                  >
                    <span className="text-xs w-4 text-center" style={{ color: 'var(--text-muted)' }}>{midOpen ? '▼' : '▶'}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: 'var(--text-muted)' }}>中</span>
                    <span className="text-sm flex-1" style={{ color: 'var(--text)' }}>{mid.name}</span>
                    <span className={`status-badge ${STATUS_COLORS[mid.status]}`}>{mid.status}</span>
                    {mid.deadline && <span className="text-xs font-medium" style={{ color: '#C9A96E' }}>{mid.deadline}</span>}
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{smalls.length}件</span>
                  </div>

                  {midOpen && smalls.map(small => (
                    <div
                      key={small.id}
                      className="flex items-center gap-3 py-2 cursor-pointer hover:opacity-80"
                      style={{ paddingLeft: '4.5rem', paddingRight: '1rem', borderTop: '1px solid var(--border)' }}
                      onClick={() => onEdit(small)}
                    >
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.04)', color: 'var(--text-muted)' }}>小</span>
                      <span className="text-sm flex-1" style={{ color: 'var(--text)' }}>{small.name}</span>
                      <span className={`status-badge ${STATUS_COLORS[small.status]}`}>{small.status}</span>
                      {small.deadline && <span className="text-xs font-medium" style={{ color: '#C9A96E' }}>{small.deadline}</span>}
                      {small.assignee && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{small.assignee}</span>}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

// ───────────────────────────────────────────────
// 今日のタスクビュー
// ───────────────────────────────────────────────
function TodayView({ onEdit, onStatusChange }: {
  onEdit: (t: Task) => void
  onStatusChange: (task: Task) => void
}) {
  const [inProgress, setInProgress] = useState<Task[]>([])
  const [upcoming, setUpcoming] = useState<Task[]>([])

  useEffect(() => {
    fetch('/api/tasks?status=進行中').then(r => r.json()).then(setInProgress)
    fetch('/api/tasks?level=小タスク&status=未着手').then(r => r.json()).then((data: Task[]) =>
      setUpcoming(data.filter(t => t.deadline).slice(0, 20))
    )
  }, [])

  const TaskRow = ({ task }: { task: Task }) => {
    const bizColor = BUSINESS_COLORS[task.business as keyof typeof BUSINESS_COLORS] ?? '#6B7280'
    return (
      <div
        className="flex items-center gap-3 py-2.5 cursor-pointer hover:opacity-80"
        style={{ borderBottom: '1px solid var(--border)' }}
        onClick={() => onEdit(task)}
      >
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: bizColor }} />
        <span className="text-sm flex-1" style={{ color: 'var(--text)' }}>{task.name}</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{task.business}</span>
        {task.deadline && <span className="text-xs font-medium" style={{ color: '#C9A96E' }}>{task.deadline}</span>}
        <button
          className={`status-badge ${STATUS_COLORS[task.status]}`}
          onClick={e => { e.stopPropagation(); onStatusChange(task) }}
        >
          {task.status}
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-4">
      <div className="card p-4">
        <h2 className="text-sm font-bold mb-3" style={{ color: '#3B82F6' }}>● 進行中 ({inProgress.length})</h2>
        {inProgress.length === 0
          ? <p className="text-sm" style={{ color: 'var(--text-muted)' }}>なし</p>
          : inProgress.map(t => <TaskRow key={t.id} task={t} />)
        }
      </div>
      <div className="card p-4">
        <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-muted)' }}>未着手（期限あり）</h2>
        {upcoming.length === 0
          ? <p className="text-sm" style={{ color: 'var(--text-muted)' }}>なし</p>
          : upcoming.map(t => <TaskRow key={t.id} task={t} />)
        }
      </div>
    </div>
  )
}

// ───────────────────────────────────────────────
// メインページ
// ───────────────────────────────────────────────
const COLUMNS: { status: Status; label: string; color: string }[] = [
  { status: '未着手', label: '未着手', color: '#6B7280' },
  { status: '今日やる', label: '今日やる', color: '#F97316' },
  { status: '進行中', label: '進行中', color: '#3B82F6' },
  { status: '完了', label: '完了', color: '#10B981' },
]

export default function KanbanPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [tasks, setTasks] = useState<Task[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [filterBiz, setFilterBiz] = useState<Business | ''>('')
  const [sortKey, setSortKey] = useState<SortKey>('default')
  const [sortAsc, setSortAsc] = useState(true)
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [modalTask, setModalTask] = useState<Partial<Task> | null>(null)
  const [addStatus, setAddStatus] = useState<Status>('未着手')
  const [toast, setToast] = useState<string | null>(null)
  const fireConfetti = useConfetti()

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const fetchTasks = useCallback(async () => {
    const params = new URLSearchParams({ level: '小タスク' })
    if (filterBiz) params.set('business', filterBiz)
    const res = await fetch(`/api/tasks?${params}`)
    setTasks(await res.json())
  }, [filterBiz])

  const fetchAllTasks = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterBiz) params.set('business', filterBiz)
    const res = await fetch(`/api/tasks?${params}`)
    setAllTasks(await res.json())
  }, [filterBiz])

  useEffect(() => { fetchTasks() }, [fetchTasks])
  useEffect(() => { if (viewMode === 'tree') fetchAllTasks() }, [viewMode, fetchAllTasks])

  const handleDragStart = (e: DragStartEvent) => setDraggingId(e.active.id as number)

  const handleDragEnd = async (e: DragEndEvent) => {
    setDraggingId(null)
    const { active, over } = e
    if (!over) return
    const dragging = tasks.find(t => t.id === active.id)
    if (!dragging) return

    let targetStatus: Status
    if (STATUSES.includes(over.id as Status)) {
      targetStatus = over.id as Status
    } else {
      const targetTask = tasks.find(t => t.id === over.id)
      if (!targetTask) return
      targetStatus = targetTask.status
    }

    if (dragging.status === targetStatus) return
    setTasks(prev => prev.map(t => t.id === active.id ? { ...t, status: targetStatus } : t))
    await fetch(`/api/tasks/${active.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: targetStatus }),
    })
    if (targetStatus === '完了') {
      fireConfetti()
      setToast('頑張ったね！タスク完了！')
    }
  }

  const handleDelete = async (id: number) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    setModalTask(null)
    fetchTasks()
    if (viewMode === 'tree') fetchAllTasks()
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
    if (data.status === '完了' && (!modalTask || (modalTask as Task).status !== '完了')) {
      fireConfetti()
      setToast('頑張ったね！タスク完了！')
    }
    setModalTask(null)
    fetchTasks()
    if (viewMode === 'tree') fetchAllTasks()
  }

  const handleStatusChange = async (task: Task) => {
    const idx = STATUSES.indexOf(task.status)
    const next = STATUSES[(idx + 1) % STATUSES.length]
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    fetchTasks()
  }

  const draggingTask = draggingId ? tasks.find(t => t.id === draggingId) : null

  const btnStyle = (active: boolean) => ({
    backgroundColor: active ? '#1F4E79' : 'var(--bg-card)',
    color: active ? '#fff' : 'var(--text)',
    borderColor: active ? '#1F4E79' : 'var(--border)',
  })

  return (
    <div className="h-full flex flex-col gap-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold wa-border pl-3" style={{ color: 'var(--text)' }}>カンバン</h1>
          <p className="text-sm mt-0.5 pl-3" style={{ color: 'var(--text-muted)' }}>
            {viewMode === 'kanban' ? 'ドラッグ&ドロップでステータスを変更' : viewMode === 'tree' ? '大→中→小 タスク階層' : '進行中・期限ありタスク'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* ビュー切り替え */}
          <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            {(['kanban', 'tree', 'today'] as ViewMode[]).map(m => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className="px-3 py-1.5 text-sm border-0"
                style={btnStyle(viewMode === m)}
              >
                {m === 'kanban' ? '⊡ カンバン' : m === 'tree' ? '▤ ツリー' : '★ 今日'}
              </button>
            ))}
          </div>

          {viewMode === 'kanban' && (
            <>
              <select
                value={filterBiz}
                onChange={e => setFilterBiz(e.target.value as Business | '')}
                className="px-3 py-1.5 rounded-lg border text-sm"
                style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
              >
                <option value="">すべての事業</option>
                {BUSINESSES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select
                value={sortKey}
                onChange={e => setSortKey(e.target.value as SortKey)}
                className="px-3 py-1.5 rounded-lg border text-sm"
                style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
              >
                <option value="default">並び順：デフォルト</option>
                <option value="deadline">並び順：期限</option>
                <option value="level">並び順：レベル</option>
              </select>
              {sortKey !== 'default' && (
                <button
                  onClick={() => setSortAsc(a => !a)}
                  className="px-2 py-1.5 rounded-lg border text-sm"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
                >
                  {sortAsc ? '↑ 昇順' : '↓ 降順'}
                </button>
              )}
            </>
          )}

          {viewMode === 'tree' && (
            <select
              value={filterBiz}
              onChange={e => { setFilterBiz(e.target.value as Business | ''); fetchAllTasks() }}
              className="px-3 py-1.5 rounded-lg border text-sm"
              style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
            >
              <option value="">すべての事業</option>
              {BUSINESSES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          )}

          <button
            onClick={() => { setModalTask({}); setAddStatus('未着手') }}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: '#1F4E79' }}
          >
            ＋ タスク追加
          </button>
        </div>
      </div>

      {/* カンバンビュー */}
      {viewMode === 'kanban' && (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
            {COLUMNS.map(col => (
              <Column
                key={col.status}
                {...col}
                tasks={sortTasks(tasks.filter(t => t.status === col.status), sortKey, sortAsc)}
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
      )}

      {/* ツリービュー */}
      {viewMode === 'tree' && (
        <TreeView allTasks={allTasks} onEdit={t => setModalTask(t)} />
      )}

      {/* 今日のタスク */}
      {viewMode === 'today' && (
        <TodayView onEdit={t => setModalTask(t)} onStatusChange={handleStatusChange} />
      )}

      {toast && <CompleteToast message={toast} onDone={() => setToast(null)} />}

      {modalTask && (
        <TaskModal
          task={modalTask.id ? (modalTask as Task) : undefined}
          defaultBusiness={(filterBiz as Business) || 'コンシェルジュ'}
          onClose={() => setModalTask(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
