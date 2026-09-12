import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/mobile-auth'

/** Affiliate dashboard bundle — mirrors the web /affiliate page Prisma query. */
export async function GET(req: NextRequest) {
  const session = await getAuthSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      commissions: true,
      sales: { orderBy: { createdAt: 'desc' }, take: 5 },
      withdrawals: { orderBy: { createdAt: 'desc' }, take: 3 },
    },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const totalEarned = user.commissions.reduce((s, c) => s + c.amount, 0)
  const available = user.commissions.filter((c) => !c.withdrawn).reduce((s, c) => s + c.amount, 0)
  const withdrawn = user.commissions.filter((c) => c.withdrawn).reduce((s, c) => s + c.amount, 0)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const referralLink = user.referralCode ? `${appUrl}/api/ref/${user.referralCode}` : null

  return NextResponse.json({
    referralCode: user.referralCode,
    referralLink,
    totalEarned,
    available,
    withdrawn,
    totalSales: user.sales.length,
    commissionsCount: user.commissions.length,
    salesRecent: user.sales.map((s) => ({
      id: s.id,
      clientName: s.clientName,
      amount: s.amount,
      createdAt: s.createdAt,
    })),
    withdrawalsRecent: user.withdrawals,
  })
}
