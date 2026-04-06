'use client'

import { useState, useEffect } from 'react'
import type { Task, Business, Level, Status } from '@/lib/types'
import { BUSINESSES, STATUSES } from '@/lib/types'

interface Props {
  task?: Partial<Task>
  defaultBusiness?: Business
  onClose: () => void
  onSave: (data: Partial<Task>) => void
}

export function TaskModal({ task, defaultBusiness, onClose, onSave }: Props) {
  const [form, setForm] = useState<Partial<Task>>({
    business: defaultBusiness ?? 'コンシェルジュ',
    level: '小タスク',
    name: '',
    assignee: '',
    deadline: '',
    notes: '',
    status: '未着手',
    ...task,
  })

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const set = (key: keyof Task, value: string) => setForm(f => ({ ...f, [key]: value }))

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="card w-full max-w-lg mx-4 p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
            {task?.id ? 'タスクを編集' : 'タスクを追加'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl">×</button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">タスク名 *</label>
            <input
              type="text"
              value={form.name ?? ''}
              onChange={e => set('name', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm bg-transparent"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              placeholder="タスク名を入力"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">事業</label>
              <select
                value={form.business ?? ''}
                onChange={e => set('business', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-transparent"
                style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
              >
                {BUSINESSES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">レベル</label>
              <select
                value={form.level ?? ''}
                onChange={e => set('level', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-transparent"
                style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
              >
                {(['大タスク', '中タスク', '小タスク'] as Level[]).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">担当</label>
              <input
                type="text"
                value={form.assignee ?? ''}
                onChange={e => set('assignee', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-transparent"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                placeholder="金子"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">期限</label>
              <input
                type="text"
                value={form.deadline ?? ''}
                onChange={e => set('deadline', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-transparent"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                placeholder="4月中"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ステータス</label>
            <select
              value={form.status ?? '未着手'}
              onChange={e => set('status', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">備考・判定基準</label>
            <textarea
              value={form.notes ?? ''}
              onChange={e => set('notes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border text-sm bg-transparent resize-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              placeholder="備考を入力"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            キャンセル
          </button>
          <button
            onClick={() => { if (form.name) onSave(form) }}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: '#1F4E79' }}
          >
            {task?.id ? '更新' : '追加'}
          </button>
        </div>
      </div>
    </div>
  )
}
