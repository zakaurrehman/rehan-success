import type { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader, EmptyState } from '@/components/ui/states'
import { Icon } from '@/components/brand/icons'

export const metadata: Metadata = { title: 'Classroom' }

const LEVEL_ORDER = ['Beginner', 'Intermediate', 'Advanced', 'Master', 'COT Research']

export default async function ClassroomPage() {
  const session = await getServerSession(authOptions)
  const isPremium = session?.user.plan === 'PREMIUM'
  const userId = session!.user.id

  const [courses, progressData] = await Promise.all([
    prisma.course.findMany({
      include: { videos: { select: { id: true } }, certificates: { where: { userId } } },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.courseProgress.findMany({ where: { userId }, select: { videoId: true } }),
  ])
  const completedVideos = new Set(progressData.map((p) => p.videoId))
  const sorted = [...courses].sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level))

  const totalVideos = courses.reduce((s, c) => s + c.videos.length, 0)
  const doneVideos = courses.reduce((s, c) => s + c.videos.filter((v) => completedVideos.has(v.id)).length, 0)
  const certs = courses.filter((c) => c.certificates.length > 0).length
  const overall = totalVideos ? Math.round((doneVideos / totalVideos) * 100) : 0

  return (
    <div className="fade-in">
      <PageHeader title="Classroom" subtitle="From Forex fundamentals to Smart Money Concepts." />

      {courses.length > 0 ? (
        <section className="card mb-6 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] items-center">
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-ink font-semibold">Your learning progress</span>
              <span className="num text-primary font-semibold">{overall}%</span>
            </div>
            <div className="progress mt-2.5"><span style={{ width: `${overall}%` }} /></div>
            <p className="text-dim text-xs mt-2">{doneVideos} of {totalVideos} lessons completed</p>
          </div>
          <div className="flex gap-3">
            <div className="card-sub text-center min-w-[92px]"><div className="num text-ink font-semibold text-lg">{courses.length}</div><div className="text-dim text-xs">Courses</div></div>
            <div className="card-sub text-center min-w-[92px]"><div className="num font-semibold text-lg" style={{ color: 'var(--rs-gold-text)' }}>{certs}</div><div className="text-dim text-xs">Certificates</div></div>
          </div>
        </section>
      ) : null}

      {sorted.length === 0 ? (
        <EmptyState icon="graduation" title="No courses published yet" description="Courses will appear here as soon as they’re released." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sorted.map((course) => {
            const total = course.videos.length
            const done = course.videos.filter((v) => completedVideos.has(v.id)).length
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            const locked = course.isPremium && !isPremium
            const certified = course.certificates.length > 0
            return (
              <Link key={course.id} href={locked ? '/order' : `/classroom/${course.id}`} className="card card-hover flex flex-col no-underline">
                <div className="flex items-start justify-between gap-3">
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: locked ? 'var(--rs-gold-tint)' : 'var(--rs-primary-tint)', color: locked ? 'var(--rs-gold-text)' : 'var(--rs-primary)' }}>
                    <Icon name={locked ? 'lock' : certified ? 'award' : 'play'} size={20} />
                  </span>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    <span className="pill pill-neutral">{course.level}</span>
                    {course.isPremium ? <span className="pill pill-gold">Premium</span> : null}
                    {certified ? <span className="pill pill-success"><Icon name="check" size={11} /> Certified</span> : null}
                  </div>
                </div>
                <h2 className="text-ink font-bold text-[17px] mt-4 tracking-tight">{course.title}</h2>
                <p className="text-muted text-sm mt-1 leading-relaxed line-clamp-2 flex-1">{course.description}</p>
                {locked ? (
                  <div className="mt-4 text-sm font-semibold inline-flex items-center gap-1" style={{ color: 'var(--rs-gold-text)' }}>Upgrade to unlock <Icon name="arrowRight" size={15} /></div>
                ) : (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1.5"><span className="text-dim">{done}/{total} lessons</span><span className="num text-ink font-semibold">{pct}%</span></div>
                    <div className="progress"><span style={{ width: `${pct}%`, background: pct === 100 ? 'var(--rs-success)' : undefined }} /></div>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
