'use client'

import { useState, useEffect } from 'react'
import type { Task, Business, Level, Status } from '@/lib/types'
import { BUSINESSES, STATUSES } from '@/lib/types'

interface Props {
  task?: Partial<Task>
  defaultBusiness?: Business
  onClose: () => void
  onSave: (data: Partial<Task>) => void
  onDelete?: (id: number) => void
}

export function TaskModal({ task, defaultBusiness, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState<Partial<Task>>({
    business: defaultBusiness ?? 'コンシェルジュ',
    level: '小タスク',
    parent_id: null,
    name: '',
    assignee: '',
    deadline: '',
    notes: '',
    status: '未着手',
    ...task,
  })
  const [parentCandidates, setParentCandidates] = useState<Task[]>([])
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Escキーで閉じる
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // レベルまたは事業が変わったら親候補を取得
  useEffect(() => {
    if (form.level === '大タスク') { setParentCandidates([]); return }
    const parentLevel = form.level === '中タスク' ? '大タスク' : '中タスク'
    const params = new URLSearchParams({ level: parentLevel })
    if (form.business) params.set('business', form.business)
    fetch(`/api/tasks?${params}`)
      .then(r => r.json())
      .then(setParentCandidates)
  }, [form.level, form.business])

  const set = (key: keyof Task, value: any) => {
    setForm(f => {
      const next = { ...f, [key]: value }
      // レベル変更時は親をリセット
      if (key === 'level') next.parent_id = null
      return next
    })
  }

  const handleDelete = () => {
    if (task?.id && onDelete) {
      onDelete(task.id)
      onClose()
    }
  }

  const parentLabel = form.level === '中タスク' ? '親の大タスク' : form.level === '小タスク' ? '親の中タスク' : null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="card w-full max-w-lg mx-4 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
            {task?.id ? 'タスクを編集' : 'タスクを追加'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>×</button>
        </div>

        <div className="flex flex-col gap-4">
          {/* タスク名 */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>タスク名 *</label>
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

          {/* 事業 / レベル */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>事業</label>
              <select
                value={form.business ?? ''}
                onChange={e => set('business', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
              >
                {BUSINESSES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>レベル</label>
              <select
                value={form.level ?? '小タスク'}
                onChange={e => set('level', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
              >
                {(['大タスク', '中タスク', '小タスク'] as Level[]).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* 親タスク選択（中・小タスクのみ） */}
          {parentLabel && (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{parentLabel}</label>
              <select
                value={form.parent_id ?? ''}
                onChange={e => set('parent_id', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
              >
                <option value="">（なし）</option>
                {parentCandidates.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {parentCandidates.length === 0 && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  同じ事業の{form.level === '中タスク' ? '大タスク' : '中タスク'}がありません
                </p>
              )}
            </div>
          )}

          {/* 担当 / 期限 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>担当</label>
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
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>期限</label>
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

          {/* ステータス */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>ステータス</label>
            <select
              value={form.status ?? '未着手'}
              onChange={e => set('status', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* 備考 */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>備考</label>
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

        {/* フッター */}
        <div className="flex items-center justify-between mt-6">
          {/* 削除ボタン */}
          <div>
            {task?.id && onDelete && !confirmDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-3 py-2 rounded-lg text-sm border"
                style={{ borderColor: '#dc262640', color: '#dc2626' }}
              >
                削除
              </button>
            )}
            {confirmDelete && (
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: '#dc2626' }}>本当に削除しますか？</span>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  削除する
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-lg text-xs border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                  戻る
                </button>
              </div>
            )}
          </div>

          {/* 保存・キャンセル */}
          <div className="flex gap-3">
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
    </div>
  )
}
