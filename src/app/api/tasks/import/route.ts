import { NextRequest, NextResponse } from 'next/server'
import { createTask, getDb } from '@/lib/db'
import { runSeed } from '@/lib/seed-data'
import { isSeeded } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ImportTask {
  name: string
  business: string
  deadline?: string
  assignee?: string
  notes?: string
  children?: ImportTask[]
}

function ensureSeeded() {
  if (!isSeeded()) runSeed(getDb())
}

function insertTree(tasks: ImportTask[], level: '大タスク' | '中タスク' | '小タスク', parentId: number | null, business: string): number {
  let count = 0
  for (const t of tasks) {
    const nextLevel = level === '大タスク' ? '中タスク' : '小タスク'
    const created = createTask({
      business: (t.business ?? business) as any,
      level,
      parent_id: parentId,
      name: t.name,
      assignee: t.assignee ?? null,
      deadline: t.deadline ?? null,
      notes: t.notes ?? null,
      status: '未着手',
      sort_order: 0,
    })
    count++
    if (t.children?.length && level !== '小タスク') {
      count += insertTree(t.children, nextLevel, created.id, t.business ?? business)
    }
  }
  return count
}

export async function POST(req: NextRequest) {
  try {
    ensureSeeded()
    const body = await req.json() as ImportTask[]
    if (!Array.isArray(body)) return NextResponse.json({ error: '配列形式で送信してください' }, { status: 400 })

    const count = insertTree(body, '大タスク', null, body[0]?.business ?? 'コンシェルジュ')
    return NextResponse.json({ imported: count })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
