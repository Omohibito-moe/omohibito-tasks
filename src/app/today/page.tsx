'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Task, Business, Status } from '@/lib/types'
import { STATUSES, BUSINESS_COLORS, STATUS_COLORS } from '@/lib/types'
import { TaskModal } from '@/components/TaskModal'

function StatusBadge({ status }: { status: Status }) {
  return <span className={`status-badge ${STATUS_COLORS[status]}`}>{status}</span>
}

function BizBadge({ business }: { business: string }) {
  const color = BUSINESS_COLORS[business as keyof typeof BUSINESS_COLORS] ?? '#6B7280'
  return (
    <span className="business-badge" style={{ backgroundColor: color + '22', color }}>
      {business}
    </span>
  )
}

function TaskRow({
  task,
  onEdit,
  onStatusChange,
}: {
  task: Task
  onEdit: (t: Task) => void
  onStatusChange: (t: Task) => void
}) {
  return (
    <div
      className="card p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onEdit(task)}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{task.name}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <BizBadge business={task.business} />
          {task.assignee && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{task.assignee}</span>
          )}
          {task.deadline && (
            <span className="text-xs font-medium" style={{ color: '#C9A96E' }}>{task.deadline}</span>
          )}
        </div>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onStatusChange(task) }}
        className="hover:scale-105 transition-transform flex-shrink-0"
      >
        <StatusBadge status={task.status} />
      </button>
    </div>
  )
}

export default function TodayPage() {
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([])
  const [pendingTasks, setPendingTasks] = useState<Task[]>([])
  const [modalTask, setModalTask] = useState<Partial<Task> | null>(null)

  const fetchTasks = useCallback(async () => {
    const [inProgressRes, pendingRes] = await Promise.all([
      fetch('/api/tasks?status=進行中'),
      fetch('/api/tasks?level=小タスク&status=未着手'),
    ])
    const [inProgress, pending] = await Promise.all([
      inProgressRes.json() as Promise<Task[]>,
      pendingRes.json() as Promise<Task[]>,
    ])
    setInProgressTasks(inProgress)
    setPendingTasks(pending)
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const handleStatusChange = async (task: Task) => {
    const idx = STATUSES.indexOf(task.status)
    const next = STATUSES[(idx + 1) % STATUSES.length]
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    await fetchTasks()
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
        body: JSON.stringify(data),
      })
    }
    setModalTask(null)
    await fetchTasks()
  }

  const totalCount = inProgressTasks.length + pendingTasks.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold wa-border pl-3" style={{ color: 'var(--text)' }}>今日のタスク</h1>
          <p className="text-sm mt-0.5 pl-3" style={{ color: 'var(--text-muted)' }}>
            進行中 {inProgressTasks.length}件 + 未着手 {pendingTasks.length}件 = 計 {totalCount}件
          </p>
        </div>
        <button
          onClick={() => setModalTask({})}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: '#1F4E79' }}
        >
          ＋ タスク追加
        </button>
      </div>

      {/* 進行中タスク */}
      <section>
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>進行中</h2>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: '#3B82F622', color: '#3B82F6' }}
          >
            {inProgressTasks.length}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {inProgressTasks.length === 0 ? (
            <p className="text-sm py-4 text-center card" style={{ color: 'var(--text-muted)' }}>
              進行中のタスクはありません
            </p>
          ) : (
            inProgressTasks.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                onEdit={t => setModalTask(t)}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </div>
      </section>

      {/* 未着手タスク（小タスク） */}
      <section>
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#6B7280' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>未着手（小タスク）</h2>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: '#6B728022', color: '#6B7280' }}
          >
            {pendingTasks.length}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {pendingTasks.length === 0 ? (
            <p className="text-sm py-4 text-center card" style={{ color: 'var(--text-muted)' }}>
              未着手の小タスクはありません
            </p>
          ) : (
            pendingTasks.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                onEdit={t => setModalTask(t)}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </div>
      </section>

      {modalTask && (
        <TaskModal
          task={modalTask.id ? (modalTask as Task) : undefined}
          defaultBusiness="コンシェルジュ"
          onClose={() => setModalTask(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
