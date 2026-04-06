export const dynamic = 'force-dynamic'

import { getProgressByBusiness, getAllTasks, getCriteria, isSeeded } from '@/lib/db'
import { getDb } from '@/lib/db'
import { runSeed } from '@/lib/seed-data'
import { BUSINESS_COLORS, BUSINESSES, STATUS_COLORS } from '@/lib/types'
import type { Task } from '@/lib/types'

function ensureSeeded() {
  if (!isSeeded()) runSeed(getDb())
}

function ProgressCard({ business, total, done }: { business: string; total: number; done: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const color = BUSINESS_COLORS[business as keyof typeof BUSINESS_COLORS] ?? '#6B7280'
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{business}</span>
        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="progress-bar mb-1">
        <div className="progress-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{done} / {total} タスク完了</p>
    </div>
  )
}

function TaskRow({ task }: { task: Task }) {
  const statusClass = STATUS_COLORS[task.status]
  const bizColor = BUSINESS_COLORS[task.business as keyof typeof BUSINESS_COLORS] ?? '#6B7280'
  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: bizColor }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{task.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{task.business}</span>
          {task.assignee && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {task.assignee}</span>}
          {task.deadline && <span className="text-xs font-medium" style={{ color: '#C9A96E' }}>· {task.deadline}</span>}
        </div>
      </div>
      <span className={`status-badge flex-shrink-0 ${statusClass}`}>{task.status}</span>
    </div>
  )
}

function CriterionRow({ criterion }: { criterion: { deadline: string; category: string; description: string } }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(201,169,110,0.15)', color: '#C9A96E' }}>
        {criterion.deadline}
      </div>
      <div>
        <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{criterion.category}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{criterion.description}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  ensureSeeded()

  const progress = getProgressByBusiness()
  const weeklyTasks = getAllTasks({ level: '小タスク', status: '未着手' }).slice(0, 15)
  const inProgressTasks = getAllTasks({ status: '進行中' }).slice(0, 8)
  const allCriteria = getCriteria()

  // Stats
  const allTasks = getAllTasks({ level: '小タスク' })
  const total = allTasks.length
  const done = allTasks.filter(t => t.status === '完了').length
  const inProgress = allTasks.filter(t => t.status === '進行中').length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold wa-border pl-3" style={{ color: 'var(--text)' }}>
            ダッシュボード
          </h1>
          <p className="text-sm mt-0.5 pl-3" style={{ color: 'var(--text-muted)' }}>
            想ひ人 Year 1 — 2026年4月〜2027年3月
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold" style={{ color: '#1F4E79' }}>{total}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>総タスク数</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold" style={{ color: '#6B8E7B' }}>{done}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>完了</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold" style={{ color: '#E8945A' }}>{inProgress}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>進行中</p>
        </div>
      </div>

      {/* Progress by business */}
      <div>
        <h2 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          事業別進捗
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {BUSINESSES.map(biz => {
            const p = progress.find(p => p.business === biz) ?? { total: 0, done: 0 }
            return <ProgressCard key={biz} business={biz} total={p.total} done={p.done} />
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly tasks */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
            直近のタスク（未着手）
          </h2>
          {weeklyTasks.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>タスクがありません</p>
          ) : (
            weeklyTasks.map(task => <TaskRow key={task.id} task={task} />)
          )}
        </div>

        {/* Criteria */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
            Year 1 判定基準
          </h2>
          {allCriteria.slice(0, 12).map(c => (
            <CriterionRow key={c.id} criterion={c} />
          ))}
        </div>
      </div>

      {/* In Progress */}
      {inProgressTasks.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>進行中</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            {inProgressTasks.map(task => <TaskRow key={task.id} task={task} />)}
          </div>
        </div>
      )}
    </div>
  )
}
