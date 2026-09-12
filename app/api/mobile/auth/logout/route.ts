import { NextRequest, NextResponse } from 'next/server'
import { revokeRefreshToken } from '@/lib/mobile-auth'

export async function POST(req: NextRequest) {
  let body: { refreshToken?: string }
  try {
    body = await req.json()
  } catch {
    body = {}
  }
  if (body.refreshToken) {
    await revokeRefreshToken(body.refreshToken)
  }
  return NextResponse.json({ ok: true })
}
