import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getAuthSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('courseId')
  const admin = searchParams.get('admin')

  if (admin) {
    const courses = await prisma.course.findMany({ include: { videos: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } })
    return NextResponse.json({ courses })
  }

  if (courseId) {
    const course = await prisma.course.findUnique({ where: { id: courseId }, include: { videos: { orderBy: { sortOrder: 'asc' } } } })
    if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    // Premium courses are only served to PREMIUM members (same rule the
    // classroom list uses to show the lock) and admins.
    if (course.isPremium && session.user.role !== 'ADMIN' && session.user.plan !== 'PREMIUM') {
      return NextResponse.json({ error: 'PREMIUM_REQUIRED' }, { status: 403 })
    }
    const progress = await prisma.courseProgress.findMany({ where: { userId: session.user.id }, select: { videoId: true } })
    return NextResponse.json({ course, completed: progress.map(p => p.videoId) })
  }

  const courses = await prisma.course.findMany({ include: { videos: { select: { id: true } }, certificates: { where: { userId: session.user.id } } }, orderBy: { sortOrder: 'asc' } })
  // `completed` is additive for the mobile list view; web computes this
  // itself via Prisma and ignores the extra field.
  const progress = await prisma.courseProgress.findMany({ where: { userId: session.user.id }, select: { videoId: true } })
  return NextResponse.json({ courses, completed: progress.map(p => p.videoId) })
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Creating courses/videos is admin-only. Marking a lesson complete is for any
  // signed-in member (previously this whole handler was admin-only, so member
  // progress and certificates could never be recorded).
  if ((body.type === 'course' || body.type === 'video') && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (body.type === 'course') {
    const course = await prisma.course.create({ data: { title: body.title, level: body.level, description: body.description, isPremium: body.isPremium } })
    return NextResponse.json(course, { status: 201 })
  }

  if (body.type === 'video') {
    const count = await prisma.video.count({ where: { courseId: body.courseId } })
    const video = await prisma.video.create({ data: { courseId: body.courseId, title: body.title, url: body.url, duration: body.duration || null, isPremium: body.isPremium, sortOrder: count } })
    return NextResponse.json(video, { status: 201 })
  }

  // Mark video complete
  const { videoId } = body
  return markComplete(session.user.id, videoId)
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession(req)
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()

  if (body.type === 'course') {
    const course = await prisma.course.update({
      where: { id: body.id },
      data: { title: body.title, level: body.level, description: body.description, isPremium: body.isPremium },
    })
    return NextResponse.json(course)
  }

  if (body.type === 'video') {
    const video = await prisma.video.update({
      where: { id: body.id },
      data: { title: body.title, url: body.url, duration: body.duration || null, isPremium: body.isPremium },
    })
    return NextResponse.json(video)
  }

  return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
}

export async function DELETE(req: NextRequest) {
  const session = await getAuthSession(req)
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { type, id } = await req.json()

  if (type === 'video') {
    // Progress rows have no DB cascade — remove them first.
    await prisma.$transaction([
      prisma.courseProgress.deleteMany({ where: { videoId: id } }),
      prisma.video.delete({ where: { id } }),
    ])
    return NextResponse.json({ ok: true })
  }

  if (type === 'course') {
    // Clean up progress (per video) + certificates, then the course
    // (videos themselves cascade at the DB level).
    const videos = await prisma.video.findMany({ where: { courseId: id }, select: { id: true } })
    await prisma.$transaction([
      prisma.courseProgress.deleteMany({ where: { videoId: { in: videos.map(v => v.id) } } }),
      prisma.certificate.deleteMany({ where: { courseId: id } }),
      prisma.course.delete({ where: { id } }),
    ])
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
}

async function markComplete(userId: string, videoId: string) {
  const existing = await prisma.courseProgress.findUnique({ where: { userId_videoId: { userId: userId, videoId } } })
  if (!existing) {
    await prisma.courseProgress.create({ data: { userId: userId, videoId } })
    // Check if course complete and issue certificate
    const video = await prisma.video.findUnique({ where: { id: videoId }, select: { courseId: true } })
    if (video) {
      const course = await prisma.course.findUnique({ where: { id: video.courseId }, include: { videos: { select: { id: true } } } })
      if (course) {
        const done = await prisma.courseProgress.count({ where: { userId: userId, videoId: { in: course.videos.map(v => v.id) } } })
        if (done >= course.videos.length) {
          await prisma.certificate.upsert({ where: { userId_courseId: { userId: userId, courseId: course.id } }, update: {}, create: { userId: userId, courseId: course.id } })
        }
      }
    }
  }
  return NextResponse.json({ ok: true })
}
