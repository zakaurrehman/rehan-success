import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const events = await prisma.economicEvent.findMany({ orderBy: { eventTime: 'asc' } })
  return NextResponse.json(events)
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession(req)
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, currency, impact, eventTime, forecast, previous } = await req.json()
  const event = await prisma.economicEvent.create({ data: { name, currency, impact, eventTime: new Date(eventTime), forecast: forecast || null, previous: previous || null } })
  return NextResponse.json(event, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession(req)
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, actual, name, currency, impact, eventTime, forecast, previous } = await req.json()
  const event = await prisma.economicEvent.update({
    where: { id },
    data: { actual, name, currency, impact, eventTime: eventTime ? new Date(eventTime) : undefined, forecast: forecast === undefined ? undefined : (forecast || null), previous: previous === undefined ? undefined : (previous || null) },
  })
  return NextResponse.json(event)
}

export async function DELETE(req: NextRequest) {
  const session = await getAuthSession(req)
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await req.json()
  await prisma.economicEvent.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

