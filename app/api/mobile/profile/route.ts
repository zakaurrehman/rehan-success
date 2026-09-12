import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/mobile-auth'

/**
 * Profile bundle for the mobile app — mirrors exactly what the web
 * profile page assembles via Prisma (user + certificates + totals).
 */
export async function GET(req: NextRequest) {
  const session = await getAuthSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      certificates: { include: { course: { select: { title: true, level: true } } } },
      commissions: { select: { amount: true, withdrawn: true } },
      sales: { select: { id: true } },
    },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const totalEarned = user.commissions.reduce((s, c) => s + c.amount, 0)

  return NextResponse.json({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    country: user.country,
    username: user.username,
    role: user.role,
    plan: user.plan,
    status: user.status,
    studentId: user.studentId,
    referralCode: user.referralCode,
    paymentMethod: user.paymentMethod,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    totalEarned,
    totalSales: user.sales.length,
    certificates: user.certificates.map((c) => ({
      id: c.id,
      issuedAt: c.issuedAt,
      course: c.course,
    })),
  })
}
