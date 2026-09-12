import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/mobile-auth'

/** Full commissions list for the affiliate (with the originating sale). */
export async function GET(req: NextRequest) {
  const session = await getAuthSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const commissions = await prisma.commission.findMany({
    where: { affiliateId: session.user.id },
    include: { sale: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(commissions)
}
