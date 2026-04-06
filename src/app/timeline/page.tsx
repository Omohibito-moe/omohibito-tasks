'use client'

import { useState, useEffect } from 'react'
import type { TimelineItem, Business } from '@/lib/types'
import { BUSINESSES, BUSINESS_COLORS, MONTHS } from '@/lib/types'

type MonthEntry = { month: string; type: '●' | '○' | null }

export default function TimelinePage() {
  const [items, setItems] = useState<TimelineItem[]>([])
  const [filterBiz, setFilterBiz] = useState<Business | ''>('')

  useEffect(() => {
    fetch('/api/timeline').then(r => r.json()).then(setItems)
  }, [])

  const filtered = filterBiz ? items.filter(i => i.business === filterBiz) : items

  // Group by business
  const grouped = BUSINESSES.reduce((acc, biz) => {
    const bizItems = filtered.filter(i => i.business === biz)
    if (bizItems.length > 0) acc[biz] = bizItems
    return acc
  }, {} as Record<string, TimelineItem[]>)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold wa-border pl-3" style={{ color: 'var(--text)' }}>タイムライン</h1>
          <p className="text-sm mt-0.5 pl-3" style={{ color: 'var(--text-muted)' }}>Year 1 全体ガントチャート（2026年4月〜2027年3月）</p>
        </div>
        <select
          value={filterBiz}
          onChange={e => setFilterBiz(e.target.value as Business | '')}
          className="px-3 py-1.5 rounded-lg border text-sm"
          style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
        >
          <option value="">すべての事業</option>
          {BUSINESSES.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#1F4E79' }} />
          <span>● 確定/最優先</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-sm border-2" style={{ borderColor: '#1F4E79' }} />
          <span>○ 計画/条件付き</span>
        </div>
      </div>

      {/* Gantt chart */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="py-3 px-3 text-left w-28 font-semibold text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>事業</th>
              <th className="py-3 px-3 text-left font-semibold text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)', minWidth: '200px' }}>タスク</th>
              {MONTHS.map(m => (
                <th key={m} className="py-3 px-1 text-center font-semibold text-xs" style={{ color: 'var(--text-muted)', minWidth: '52px' }}>
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([biz, bizItems]) => {
              const color = BUSINESS_COLORS[biz as keyof typeof BUSINESS_COLORS] ?? '#6B7280'
              return bizItems.map((item, idx) => {
                const months: MonthEntry[] = JSON.parse(item.months)
                return (
                  <tr
                    key={item.id}
                    style={{ borderBottom: '1px solid var(--border)', opacity: 0.95 }}
                    className="hover:opacity-100 transition-opacity"
                  >
                    {idx === 0 ? (
                      <td
                        className="py-2 px-3 align-top"
                        rowSpan={bizItems.length}
                        style={{ borderRight: `3px solid ${color}` }}
                      >
                        <span className="text-xs font-bold" style={{ color }}>{biz}</span>
                      </td>
                    ) : null}
                    <td className="py-2 px-3 text-xs" style={{ color: 'var(--text)' }}>
                      {item.task_name}
                    </td>
                    {months.map((entry, mi) => (
                      <td key={mi} className="py-2 px-1 text-center">
                        {entry.type === '●' && (
                          <div
                            className="mx-auto rounded-sm"
                            style={{ width: 36, height: 20, backgroundColor: color }}
                          />
                        )}
                        {entry.type === '○' && (
                          <div
                            className="mx-auto rounded-sm border-2"
                            style={{ width: 36, height: 20, borderColor: color }}
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                )
              })
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
