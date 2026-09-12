import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  // Single post with full comments + reactions (mobile detail screen).
  // Additive only — web pages query Prisma directly and never pass ?id.
  if (id) {
    const session = await getAuthSession(req)
    const post = await prisma.communityPost.findUnique({
      where: { id },
      include: {
        author: { select: { fullName: true, studentId: true } },
        comments: {
          include: { author: { select: { fullName: true, studentId: true } } },
          orderBy: { createdAt: 'asc' },
        },
        reactions: true,
      },
    })
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const likes = post.reactions.filter((r) => r.type === 'LIKE').length
    const dislikes = post.reactions.filter((r) => r.type === 'DISLIKE').length
    const userReaction = session
      ? post.reactions.find((r) => r.userId === session.user.id)?.type ?? null
      : null
    return NextResponse.json({
      id: post.id,
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      author: post.author,
      likes,
      dislikes,
      userReaction,
      comments: post.comments.map((c) => ({
        id: c.id,
        content: c.content,
        authorName: c.author.fullName,
        studentId: c.author.studentId,
        createdAt: c.createdAt.toISOString(),
      })),
    })
  }

  const posts = await prisma.communityPost.findMany({
    include: { author: { select: { fullName: true, studentId: true } }, comments: { select: { id: true } }, reactions: { select: { type: true } } },
    orderBy: { createdAt: 'desc' },
    take: 30
  })
  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, content, imageUrl } = await req.json()
  const post = await prisma.communityPost.create({
    data: { title, content, imageUrl: imageUrl || null, authorId: session.user.id },
    include: { author: { select: { fullName: true, studentId: true } } }
  })
  return NextResponse.json(post, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { postId, type } = await req.json()
  const existing = await prisma.postReaction.findUnique({ where: { postId_userId: { postId, userId: session.user.id } } })

  if (existing) {
    if (existing.type === type) {
      await prisma.postReaction.delete({ where: { id: existing.id } })
    } else {
      await prisma.postReaction.update({ where: { id: existing.id }, data: { type } })
    }
  } else {
    await prisma.postReaction.create({ data: { postId, userId: session.user.id, type } })
  }
  return NextResponse.json({ ok: true })
}
