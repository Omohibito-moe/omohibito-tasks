'use client'

import { useState } from 'react'
import { BUSINESSES } from '@/lib/types'

interface Props {
  onClose: () => void
  onDone: () => void
}

const PROMPT_TEMPLATE = `以下のJSON形式でタスクを出力してください。
businessは必ず以下のいずれか: "コンシェルジュ" "DX事業" "リスキリング" "ケアガイド" "資金調達" "集客戦略サマリー"

[
  {
    "business": "事業名",
    "name": "大タスク名",
    "deadline": "期限（任意）",
    "children": [
      {
        "name": "中タスク名",
        "deadline": "期限（任意）",
        "children": [
          {
            "name": "小タスク名",
            "assignee": "担当者（任意）",
            "deadline": "期限（任意）",
            "notes": "備考（任意）"
          }
        ]
      }
    ]
  }
]

---対象の戦略・タスク内容---
（ここに壁打ち内容を貼る）`

export function ImportModal({ onClose, onDone }: Props) {
  const [tab, setTab] = useState<'prompt' | 'import'>('prompt')
  const [json, setJson] = useState('')
  const [preview, setPreview] = useState<any[] | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(0)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(PROMPT_TEMPLATE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleParse = () => {
    setError('')
    setPreview(null)
    try {
      const parsed = JSON.parse(json)
      if (!Array.isArray(parsed)) throw new Error('配列形式にしてください')
      setPreview(parsed)
    } catch (e: any) {
      setError('JSONの形式が正しくありません: ' + e.message)
    }
  }

  const handleImport = async () => {
    if (!preview) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/tasks/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preview),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDone(data.imported)
      setTimeout(() => { onDone(); onClose() }, 1500)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function countTasks(tasks: any[], depth = 0): number {
    return tasks.reduce((acc: number, t: any) => acc + 1 + (t.children ? countTasks(t.children, depth + 1) : 0), 0)
  }

  function PreviewTree({ tasks, depth = 0 }: { tasks: any[], depth?: number }) {
    const levelLabel = depth === 0 ? '大' : depth === 1 ? '中' : '小'
    const indent = depth * 20
    return (
      <>
        {tasks.map((t, i) => (
          <div key={i}>
            <div className="flex items-center gap-2 py-1.5 text-sm" style={{ paddingLeft: indent + 8 }}>
              <span className="text-xs px-1 rounded font-bold" style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: 'var(--text-muted)', minWidth: 16, textAlign: 'center' }}>{levelLabel}</span>
              <span style={{ color: 'var(--text)' }}>{t.name}</span>
              {t.deadline && <span className="text-xs ml-auto" style={{ color: '#C9A96E' }}>{t.deadline}</span>}
              {t.assignee && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.assignee}</span>}
            </div>
            {t.children && <PreviewTree tasks={t.children} depth={depth + 1} />}
          </div>
        ))}
      </>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="card w-full max-w-2xl mx-4 flex flex-col" style={{ maxHeight: '85vh' }}>
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>タスク一括インポート</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Claudeで戦略をタスク化してインポート</p>
          </div>
          <button onClick={onClose} className="text-xl leading-none" style={{ color: 'var(--text-muted)' }}>✕</button>
        </div>

        {/* タブ */}
        <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
          {(['prompt', 'import'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-5 py-2.5 text-sm font-medium border-b-2 transition-colors"
              style={{
                borderBottomColor: tab === t ? '#1F4E79' : 'transparent',
                color: tab === t ? '#1F4E79' : 'var(--text-muted)',
              }}
            >
              {t === 'prompt' ? '① Claudeに渡すプロンプト' : '② JSONを貼り付け'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {tab === 'prompt' ? (
            <>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                このプロンプトをコピーして、Claude（claude.ai）との会話に貼り付けてください。<br />
                出力されたJSONを②に貼り付けてインポートします。
              </p>
              <div className="relative">
                <pre className="text-xs p-4 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed"
                  style={{ backgroundColor: 'rgba(0,0,0,0.04)', color: 'var(--text)', fontFamily: 'monospace' }}>
                  {PROMPT_TEMPLATE}
                </pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 text-xs px-3 py-1 rounded-lg font-medium text-white"
                  style={{ backgroundColor: copied ? '#6B8E7B' : '#1F4E79' }}
                >
                  {copied ? '✓ コピー済み' : 'コピー'}
                </button>
              </div>
              <button
                onClick={() => setTab('import')}
                className="w-full py-2 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: '#1F4E79' }}
              >
                JSONを貼り付けへ進む →
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>
                  ClaudeのJSON出力を貼り付け
                </label>
                <textarea
                  value={json}
                  onChange={e => { setJson(e.target.value); setPreview(null); setError('') }}
                  placeholder={'[\n  {\n    "business": "コンシェルジュ",\n    "name": "大タスク名",\n    ...\n  }\n]'}
                  rows={8}
                  className="w-full px-3 py-2 rounded-lg border text-sm font-mono"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)', resize: 'vertical' }}
                />
              </div>

              {error && (
                <p className="text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                  ⚠ {error}
                </p>
              )}

              {done > 0 && (
                <p className="text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                  ✓ {done}件のタスクをインポートしました！
                </p>
              )}

              {!preview ? (
                <button
                  onClick={handleParse}
                  disabled={!json.trim()}
                  className="w-full py-2 rounded-lg text-sm font-medium border"
                  style={{ borderColor: 'var(--border)', color: json.trim() ? 'var(--text)' : 'var(--text-muted)', backgroundColor: 'var(--bg-card)' }}
                >
                  内容を確認する
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                    <div className="px-4 py-2 text-xs font-semibold" style={{ backgroundColor: 'rgba(0,0,0,0.04)', color: 'var(--text-muted)' }}>
                      プレビュー（{countTasks(preview)}件）
                    </div>
                    <div className="max-h-52 overflow-y-auto divide-y" style={{ borderColor: 'var(--border)' }}>
                      <PreviewTree tasks={preview} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreview(null)}
                      className="flex-1 py-2 rounded-lg text-sm border"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                    >
                      修正する
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={loading}
                      className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
                      style={{ backgroundColor: loading ? '#6B8E7B' : '#1F4E79' }}
                    >
                      {loading ? 'インポート中...' : `${countTasks(preview)}件をインポート`}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
