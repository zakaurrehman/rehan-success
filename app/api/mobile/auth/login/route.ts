import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signAccessToken, issueRefreshToken } from '@/lib/mobile-auth'
import { rateLimit, clientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = clientIp(req)

  let body: { username?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const username = body.username?.trim()
  const password = body.password
  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
  }

  // Rate limit per IP + username to slow credential stuffing.
  const limited = rateLimit(`login:${ip}:${username.toLowerCase()}`, 8, 60_000)
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } }
    )
  }

  // Accept either a username OR an email — users mix them up constantly.
  const identifier = username
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: identifier },
        { email: identifier.toLowerCase() },
      ],
    },
  })
  // Constant-ish response regardless of which check fails (no user enumeration).
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  if (user.role !== 'ADMIN' && user.status !== 'APPROVED') {
    return NextResponse.json(
      { error: 'PENDING_APPROVAL', message: 'Your account is awaiting approval.' },
      { status: 403 }
    )
  }

  const accessToken = signAccessToken({
    id: user.id,
    role: user.role,
    plan: user.plan,
    studentId: user.studentId,
  })
  const refreshToken = await issueRefreshToken(user.id)

  return NextResponse.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      plan: user.plan,
      status: user.status,
      studentId: user.studentId,
      referralCode: user.referralCode,
      avatarUrl: user.avatarUrl,
    },
  })
}
