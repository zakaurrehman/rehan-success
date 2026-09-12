import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  rotateRefreshToken,
  issueRefreshToken,
  signAccessToken,
} from '@/lib/mobile-auth'

export async function POST(req: NextRequest) {
  let body: { refreshToken?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const presented = body.refreshToken
  if (!presented) {
    return NextResponse.json({ error: 'Missing refresh token' }, { status: 400 })
  }

  const userId = await rotateRefreshToken(presented)
  if (!userId) {
    return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ error: 'Account no longer exists' }, { status: 401 })
  }
  if (user.role !== 'ADMIN' && user.status !== 'APPROVED') {
    return NextResponse.json({ error: 'PENDING_APPROVAL' }, { status: 403 })
  }

  const accessToken = signAccessToken({
    id: user.id,
    role: user.role,
    plan: user.plan,
    studentId: user.studentId,
  })
  const refreshToken = await issueRefreshToken(user.id)

  return NextResponse.json({ accessToken, refreshToken })
}
