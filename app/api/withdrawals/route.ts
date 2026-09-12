import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getAuthSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const commissions = await prisma.commission.findMany({ where: { affiliateId: session.user.id } })
  const available = commissions.filter(c => !c.withdrawn).reduce((s, c) => s + c.amount, 0)
  const requests = await prisma.withdrawalRequest.findMany({ where: { affiliateId: session.user.id }, orderBy: { createdAt: 'desc' } })

  return NextResponse.json({ available, requests })
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { amount, note } = await req.json()

  const available = await prisma.commission.aggregate({
    where: { affiliateId: session.user.id, withdrawn: false },
    _sum: { amount: true }
  })

  if ((available._sum.amount || 0) < amount) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
  }

  const request = await prisma.withdrawalRequest.create({ data: { affiliateId: session.user.id, amount, note } })
  return NextResponse.json(request, { status: 201 })
}
