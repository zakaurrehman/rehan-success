import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all')
  const session = await getAuthSession(req)

  const reviews = await prisma.review.findMany({
    where: all && session?.user.role === 'ADMIN' ? {} : { status: 'APPROVED' },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(reviews)
}

export async function POST(req: NextRequest) {
  const { clientName, email, rating, content } = await req.json()
  const review = await prisma.review.create({ data: { clientName, email, rating, content } })
  return NextResponse.json(review, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession(req)
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, status } = await req.json()
  const review = await prisma.review.update({ where: { id }, data: { status } })
  return NextResponse.json(review)
}
