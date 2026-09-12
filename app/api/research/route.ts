import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const admin = searchParams.get('admin')
  const session = await getAuthSession(req)

  const isAdmin = session?.user.role === 'ADMIN'
  const posts = await prisma.researchPost.findMany({
    where: admin && isAdmin ? {} : { published: true },
    include: { author: { select: { fullName: true } } },
    orderBy: { createdAt: 'desc' }
  })

  // Premium analysis is only returned to PREMIUM members and admins; everyone
  // else still sees the post metadata (title, category, lock state).
  const canReadPremium = isAdmin || session?.user.plan === 'PREMIUM'
  return NextResponse.json(
    canReadPremium ? posts : posts.map((p) => (p.isPremium ? { ...p, content: '' } : p))
  )
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession(req)
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, category, content, imageUrl, isPremium } = await req.json()
  const post = await prisma.researchPost.create({
    data: { title, category, content, imageUrl: imageUrl || null, isPremium, authorId: session.user.id },
    include: { author: { select: { fullName: true } } }
  })
  return NextResponse.json(post, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession(req)
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, published, isPremium, title, category, content, imageUrl } = await req.json()
  const post = await prisma.researchPost.update({
    where: { id },
    data: { published, isPremium, title, category, content, imageUrl: imageUrl === undefined ? undefined : (imageUrl || null) },
    include: { author: { select: { fullName: true } } },
  })
  return NextResponse.json(post)
}

export async function DELETE(req: NextRequest) {
  const session = await getAuthSession(req)
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await req.json()
  await prisma.researchPost.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

