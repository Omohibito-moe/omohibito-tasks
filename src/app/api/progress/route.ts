import { NextResponse } from 'next/server'
import { getProgressByBusiness } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const progress = getProgressByBusiness()
  return NextResponse.json(progress)
}
