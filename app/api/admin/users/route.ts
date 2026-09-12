import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'
import { generateReferralCode } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const session = await getAuthSession(req)
  if (session?.user.role !== 'ADMIN') return NextResponse.json([], { status: 403 })

  const users = await prisma.user.findMany({
    where: { role: { not: 'ADMIN' } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, fullName: true, email: true, username: true, role: true, plan: true, status: true, studentId: true, createdAt: true }
  })
  return NextResponse.json(users)
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession(req)
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, status, plan, role } = await req.json()
  const updates: Record<string, unknown> = {}
  if (status !== undefined) updates.status = status
  if (plan !== undefined) updates.plan = plan
  if (role !== undefined) updates.role = role

  if (status === 'APPROVED') {
    const user = await prisma.user.findUnique({ where: { id } })
    if (user && !user.referralCode) {
      updates.referralCode = generateReferralCode(user.username)
    }
  }

  const user = await prisma.user.update({ where: { id }, data: updates, select: { id: true, status: true, plan: true, role: true, referralCode: true } })
  return NextResponse.json(user)
}
