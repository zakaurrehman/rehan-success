import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/mobile-auth'

/**
 * Register / refresh an Expo push token for the authenticated user.
 * Upserts by the (unique) expoPushToken so a device that switches
 * accounts is reassigned rather than duplicated.
 */
export async function POST(req: NextRequest) {
  const session = await getAuthSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { expoPushToken?: string; platform?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const expoPushToken = body.expoPushToken?.trim()
  const platform = (body.platform || 'unknown').toLowerCase()
  if (!expoPushToken) {
    return NextResponse.json({ error: 'expoPushToken is required' }, { status: 400 })
  }

  await prisma.deviceToken.upsert({
    where: { expoPushToken },
    update: { userId: session.user.id, platform },
    create: { userId: session.user.id, expoPushToken, platform },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getAuthSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { expoPushToken?: string }
  try {
    body = await req.json()
  } catch {
    body = {}
  }
  if (body.expoPushToken) {
    await prisma.deviceToken
      .deleteMany({ where: { expoPushToken: body.expoPushToken, userId: session.user.id } })
      .catch(() => {})
  }
  return NextResponse.json({ ok: true })
}
