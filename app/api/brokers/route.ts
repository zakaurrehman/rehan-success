import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  // `?all=1` (admins only) includes hidden brokers so they can be re-activated.
  const all = new URL(req.url).searchParams.get('all')
  const isAdmin = all ? (await getAuthSession(req))?.user.role === 'ADMIN' : false
  const brokers = await prisma.broker.findMany({
    where: isAdmin ? {} : { isActive: true },
    orderBy: [{ isRecommended: 'desc' }, { rating: 'desc' }],
  })
  return NextResponse.json(brokers)
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession(req)
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, description, rating, link, minDeposit, regulation, isRecommended } = await req.json()
  const broker = await prisma.broker.create({ data: { name, description, rating, link, minDeposit: minDeposit || null, regulation: regulation || null, isRecommended } })
  return NextResponse.json(broker, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession(req)
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, ...data } = await req.json()
  const broker = await prisma.broker.update({ where: { id }, data })
  return NextResponse.json(broker)
}

export async function DELETE(req: NextRequest) {
  const session = await getAuthSession(req)
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await req.json()
  await prisma.broker.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

