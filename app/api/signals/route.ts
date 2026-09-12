import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'
import { pushToAll } from '@/lib/push'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all')

  if (all) {
    const session = await getAuthSession(req)
    if (session?.user.role !== 'ADMIN') return NextResponse.json([], { status: 403 })
    const signals = await prisma.signal.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(signals)
  }

  // Read-only helpers for the mobile app (web pages query prisma directly,
  // so this is additive and does not change web behavior).
  if (searchParams.get('stats')) {
    // Ordered by last update: month labels ("Aug 2026") don't sort correctly as strings.
    const [current, months] = await Promise.all([
      prisma.signalStat.findFirst({ orderBy: { updatedAt: 'desc' } }),
      prisma.signalStat.findMany({ orderBy: { updatedAt: 'desc' }, take: 6 }),
    ])
    return NextResponse.json({ current, months })
  }

  if (searchParams.get('history')) {
    const closed = await prisma.signal.findMany({
      where: { status: { in: ['HIT_TP', 'HIT_SL', 'CLOSED'] } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json(closed)
  }

  const signals = await prisma.signal.findMany({ where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(signals)
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession(req)
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { pair, direction, entry, tp1, tp2, tp3, sl, notes } = await req.json()
  const signal = await prisma.signal.create({ data: { pair, direction, entry, tp1, tp2, tp3, sl, notes } })

  await pushToAll({
    title: `🔔 New Signal: ${signal.pair}`,
    body: `${signal.direction} @ ${signal.entry} · TP ${signal.tp1} · SL ${signal.sl}`,
    data: { type: 'signal', signalId: signal.id, link: '/signals' },
  })

  return NextResponse.json(signal, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getAuthSession(req)
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  // Permanent removal — used for mistaken entries so they don't pollute
  // signal history or win-rate stats. No push notification is sent.
  await prisma.signal.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession(req)
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { id, status, pips } = body

  // Field edit (no status change): silently correct the signal's details.
  // No push is sent — corrections shouldn't re-notify users.
  if (!status) {
    const { pair, direction, entry, tp1, tp2, tp3, sl, notes } = body
    const signal = await prisma.signal.update({
      where: { id },
      data: { pair, direction, entry, tp1, tp2, tp3, sl, notes },
    })
    return NextResponse.json(signal)
  }

  const signal = await prisma.signal.update({
    where: { id },
    data: { status, pips, closedAt: status !== 'ACTIVE' ? new Date() : null }
  })

  if (status === 'HIT_TP' || status === 'HIT_SL' || status === 'CLOSED') {
    const outcome =
      status === 'HIT_TP' ? '✅ Target hit' : status === 'HIT_SL' ? '🛑 Stop loss hit' : '⏹️ Closed'
    await pushToAll({
      title: `${signal.pair} ${outcome}`,
      body:
        typeof signal.pips === 'number'
          ? `${signal.pips >= 0 ? '+' : ''}${signal.pips} pips`
          : 'Signal closed',
      data: { type: 'signal', signalId: signal.id, link: '/signals' },
    })
  }

  return NextResponse.json(signal)
}
