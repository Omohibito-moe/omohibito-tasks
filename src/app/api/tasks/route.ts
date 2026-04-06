import { NextRequest, NextResponse } from 'next/server'
import { getAllTasks, createTask, isSeeded } from '@/lib/db'
import { runSeed } from '@/lib/seed-data'
import { getDb } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function ensureSeeded() {
  if (!isSeeded()) {
    runSeed(getDb())
  }
}

export async function GET(req: NextRequest) {
  try {
    ensureSeeded()
    const { searchParams } = new URL(req.url)
    const filters = {
      business: searchParams.get('business') || undefined,
      status: searchParams.get('status') || undefined,
      level: searchParams.get('level') || undefined,
      assignee: searchParams.get('assignee') || undefined,
    }
    const tasks = getAllTasks(filters)
    return NextResponse.json(tasks)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    ensureSeeded()
    const body = await req.json()
    const task = createTask({
      business: body.business,
      level: body.level,
      parent_id: body.parent_id ?? null,
      name: body.name,
      assignee: body.assignee ?? null,
      deadline: body.deadline ?? null,
      notes: body.notes ?? null,
      status: body.status ?? '未着手',
      sort_order: body.sort_order ?? 0,
    })
    return NextResponse.json(task, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
