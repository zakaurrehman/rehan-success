import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getAuthSession(req)
  if (!session) return NextResponse.json([])

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50
  })
  return NextResponse.json(notifications)
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  await prisma.notification.update({ where: { id, userId: session.user.id }, data: { read: true } })
  return NextResponse.json({ ok: true })
}
