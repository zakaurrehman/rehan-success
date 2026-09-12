import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getAuthSession(req)
  if (session?.user.role !== 'ADMIN') return NextResponse.json([], { status: 403 })

  const affiliates = await prisma.user.findMany({
    where: { role: 'AFFILIATE', status: 'APPROVED' },
    select: { id: true, fullName: true, username: true },
    orderBy: { fullName: 'asc' }
  })
  return NextResponse.json(affiliates)
}
