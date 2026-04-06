import { NextResponse } from 'next/server'
import { getTimelineItems } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const items = getTimelineItems()
  return NextResponse.json(items)
}
