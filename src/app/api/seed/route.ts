import { NextResponse } from 'next/server'
import { getDb, isSeeded } from '@/lib/db'
import { runSeed } from '@/lib/seed-data'

export const runtime = 'nodejs'

export async function POST() {
  try {
    if (isSeeded()) {
      return NextResponse.json({ message: 'Already seeded' }, { status: 200 })
    }
    const db = getDb()
    runSeed(db)
    return NextResponse.json({ message: 'Seeded successfully' }, { status: 200 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db = getDb()
    runSeed(db)
    return NextResponse.json({ message: 'Seeded successfully' })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
