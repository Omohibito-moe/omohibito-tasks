'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Task, Business, Status, Level } from '@/lib/types'
import { BUSINESSES, STATUSES, BUSINESS_COLORS, STATUS_COLORS } from '@/lib/types'
import { TaskModal } from '@/components/TaskModal'

type SortKey = 'business' | 'deadline' | 'assignee' | 'status' | 'name'

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

export default function ListPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filterBiz, setFilterBiz] = useState<Business | ''>('')
  const [filterStatus, setFilterStatus] = useState<Status | ''>('')
  const [filterLevel, setFilterLevel] = useState<Level | ''>('')
  const [filterAssignee, setFilterAssignee] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('business')
  const [sortAsc, setSortAsc] = useState(true)
  const [modalTask, setModalTask] = useState<Partial<Task> | null>(null)
  const [search, setSearch] = useState('')

  const fetchTasks = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterBiz) params.set('business', filterBiz)
    if (filterStatus) params.set('status', filterStatus)
    if (filterLevel) params.set('level', filterLevel)
    if (filterAssignee) params.set('assignee', filterAssignee)
    const res = await fetch(`/api/tasks?${params}`)
    setTasks(await res.json())
  }, [filterBiz, filterStatus, filterLevel, filterAssignee])

  useEffect(() => { fetchTasks() }, [fetchTasks])

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

  const handleDelete = async (id: number) => {
    if (!confirm('このタスクを削除しますか？')) return
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    setModalTask(null)
    await fetchTasks()
  }

  const handleStatusClick = async (task: Task) => {
    const idx = STATUSES.indexOf(task.status)
    const next = STATUSES[(idx + 1) % STATUSES.length]
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: next } : t))
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(true) }
  }

  const sorted = [...tasks]
    .filter(t => !search || t.name.includes(search) || (t.assignee ?? '').includes(search))
    .sort((a, b) => {
      const va = (a[sortKey] ?? '') as string
      const vb = (b[sortKey] ?? '') as string
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va)
    })

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? <span>{sortAsc ? ' ↑' : ' ↓'}</span> : <span className="opacity-20"> ↕</span>

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold wa-border pl-3" style={{ color: 'var(--text)' }}>タスクリスト</h1>
          <p className="text-sm mt-0.5 pl-3" style={{ color: 'var(--text-muted)' }}>全タスク一覧 — {sorted.length} 件</p>
        </div>
        <button
          onClick={() => setModalTask({})}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: '#1F4E79' }}
        >
          ＋ タスク追加
        </button>
      </div>

      {/* Filters */}
      <div className="card p-3 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="タスク名・担当で検索"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-1.5 rounded-lg border text-sm flex-1 min-w-40 bg-transparent"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        />
        <select
          value={filterBiz}
          onChange={e => setFilterBiz(e.target.value as Business | '')}
          className="px-2 py-1.5 rounded-lg border text-sm"
          style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
        >
          <option value="">事業：すべて</option>
          {BUSINESSES.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as Status | '')}
          className="px-2 py-1.5 rounded-lg border text-sm"
          style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
        >
          <option value="">ステータス：すべて</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterLevel}
          onChange={e => setFilterLevel(e.target.value as Level | '')}
          className="px-2 py-1.5 rounded-lg border text-sm"
          style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
        >
          <option value="">レベル：すべて</option>
          <option value="大タスク">大タスク</option>
          <option value="中タスク">中タスク</option>
          <option value="小タスク">小タスク</option>
        </select>
        <button
          onClick={() => { setFilterBiz(''); setFilterStatus(''); setFilterLevel(''); setFilterAssignee(''); setSearch('') }}
          className="px-2 py-1.5 rounded-lg border text-xs"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          リセット
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              {([['name', 'タスク名'], ['business', '事業'], ['assignee', '担当'], ['deadline', '期限'], ['status', 'ステータス']] as [SortKey, string][]).map(([k, label]) => (
                <th
                  key={k}
                  className="py-3 px-3 text-left font-semibold text-xs uppercase tracking-wide cursor-pointer hover:opacity-70 transition-opacity select-none"
                  style={{ color: 'var(--text-muted)' }}
                  onClick={() => handleSort(k)}
                >
                  {label}<SortIcon k={k} />
                </th>
              ))}
              <th className="py-3 px-3 text-left font-semibold text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(task => (
              <tr
                key={task.id}
                className="hover:opacity-80 transition-opacity"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <td className="py-2.5 px-3" style={{ color: 'var(--text)', maxWidth: '400px' }}>
                  <div>
                    <span className="text-xs font-medium mr-2" style={{ color: 'var(--text-muted)' }}>
                      {task.level === '大タスク' ? '━' : task.level === '中タスク' ? '┣' : '┗'}
                    </span>
                    {task.name}
                  </div>
                  {task.notes && (
                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{task.notes}</p>
                  )}
                </td>
                <td className="py-2.5 px-3"><BizBadge business={task.business} /></td>
                <td className="py-2.5 px-3 text-xs" style={{ color: 'var(--text-muted)' }}>{task.assignee ?? '—'}</td>
                <td className="py-2.5 px-3 text-xs font-medium" style={{ color: task.deadline ? '#C9A96E' : 'var(--text-muted)' }}>
                  {task.deadline ?? '—'}
                </td>
                <td className="py-2.5 px-3">
                  <button onClick={() => handleStatusClick(task)} className="hover:scale-105 transition-transform">
                    <StatusBadge status={task.status} />
                  </button>
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModalTask(task)}
                      className="text-xs px-2 py-0.5 rounded border hover:opacity-70"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-xs px-2 py-0.5 rounded border hover:opacity-70"
                      style={{ borderColor: '#dc262640', color: '#dc2626' }}
                    >
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  タスクが見つかりません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
