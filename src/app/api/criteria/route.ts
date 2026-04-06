import { NextRequest, NextResponse } from 'next/server'
import { getCriteria } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const business = searchParams.get('business') || undefined
  const criteria = getCriteria(business)
  return NextResponse.json(criteria)
}
