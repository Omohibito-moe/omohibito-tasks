import { NextResponse } from 'next/server'
import { getTimelineItems } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  const items = getTimelineItems()
  return NextResponse.json(items)
}
