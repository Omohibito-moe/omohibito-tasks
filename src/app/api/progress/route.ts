import { NextResponse } from 'next/server'
import { getProgressByBusiness } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const progress = getProgressByBusiness()
    return NextResponse.json(progress)
  } catch {
    return NextResponse.json([])
  }
}
