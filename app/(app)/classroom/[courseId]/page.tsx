'use client'
import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@/components/brand/icons'
import { Button } from '@/components/ui/Button'
import { ErrorState, SkeletonList } from '@/components/ui/states'
import { useFeedback } from '@/components/ui/feedback'

type Video = { id: string; title: string; url: string; duration: string | null; sortOrder: number; isPremium: boolean }
type Course = { id: string; title: string; level: string; description: string; videos: Video[] }

function getEmbedUrl(url: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  return url
}

export default function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params)
  const { toast } = useFeedback()
  const [course, setCourse] = useState<Course | null>(null)
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [activeVideo, setActiveVideo] = useState<Video | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'locked' | 'error'>('loading')
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/classroom?courseId=${courseId}`)
      .then(async (r) => {
        if (r.status === 403) { if (!cancelled) setStatus('locked'); return }
        if (!r.ok) throw new Error()
        const data = await r.json()
        if (cancelled) return
        setCourse(data.course)
        setCompleted(new Set(data.completed))
        setActiveVideo(data.course?.videos[0] || null)
        setStatus('ready')
      })
      .catch(() => !cancelled && setStatus('error'))
    return () => { cancelled = true }
  }, [courseId])

  async function markComplete(videoId: string) {
    setMarking(true)
    try {
      const res = await fetch('/api/classroom', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videoId }) })
      if (!res.ok) throw new Error()
      const next = new Set(Array.from(completed).concat(videoId))
      setCompleted(next)
      if (course && course.videos.every((v) => next.has(v.id))) toast('Course complete — certificate issued!')
      else {
        toast('Lesson marked complete')
        const idx = course?.videos.findIndex((v) => v.id === videoId) ?? -1
        const upNext = course?.videos.slice(idx + 1).find((v) => !next.has(v.id))
        if (upNext) setActiveVideo(upNext)
      }
    } catch {
      toast('Could not update progress', 'error')
    } finally {
      setMarking(false)
    }
  }

  const back = (
    <Link href="/classroom" className="link-muted inline-flex items-center gap-1 text-[13px] font-medium mb-4">
      <Icon name="chevronLeft" size={16} /> Classroom
    </Link>
  )

  if (status === 'loading') return <div>{back}<div className="skeleton w-2/3 h-8 mb-4" /><div className="skeleton rounded-2xl mb-4" style={{ aspectRatio: '16/9' }} /><SkeletonList rows={3} height={56} /></div>
  if (status === 'locked') {
    return (
      <div>{back}
        <div className="card text-center py-14 max-w-xl">
          <span className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--rs-gold-tint)', color: 'var(--rs-gold-text)' }}><Icon name="lock" size={24} /></span>
          <h1 className="text-xl font-bold mt-4">Premium course</h1>
          <p className="text-muted text-sm mt-1.5">Upgrade to the Premium plan to access this course.</p>
          <div className="mt-6"><Button href="/order" variant="gold" icon="sparkles">View plans</Button></div>
        </div>
      </div>
    )
  }
  if (status === 'error' || !course) return <div>{back}<ErrorState title="Course not found" description="It may have been removed or the link is incorrect." action={<Button href="/classroom" variant="secondary">Back to classroom</Button>} /></div>

  const total = course.videos.length
  const done = course.videos.filter((v) => completed.has(v.id)).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="fade-in">
      {back}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div className="min-w-0">
          <span className="pill pill-neutral">{course.level}</span>
          <h1 className="page-title mt-2">{course.title}</h1>
        </div>
        <div className="min-w-[200px]">
          <div className="flex justify-between text-xs mb-1.5"><span className="text-muted">{done}/{total} complete</span><span className="num text-primary font-semibold">{pct}%</span></div>
          <div className="progress"><span style={{ width: `${pct}%`, background: pct === 100 ? 'var(--rs-success)' : undefined }} /></div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div>
          {activeVideo ? (
            <>
              <div className="relative rounded-2xl overflow-hidden border hairline bg-black" style={{ aspectRatio: '16/9' }}>
                <iframe
                  key={activeVideo.id}
                  src={getEmbedUrl(activeVideo.url)}
                  title={activeVideo.title}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="card mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-dim text-xs">Lesson {course.videos.findIndex((v) => v.id === activeVideo.id) + 1} of {total}</div>
                  <h2 className="text-ink font-bold text-base mt-0.5">{activeVideo.title}</h2>
                </div>
                {completed.has(activeVideo.id) ? (
                  <span className="pill pill-success !text-xs !px-3 !py-1.5"><Icon name="checkCircle" size={14} /> Completed</span>
                ) : (
                  <Button variant="success" icon="check" loading={marking} onClick={() => markComplete(activeVideo.id)}>Mark complete</Button>
                )}
              </div>
            </>
          ) : (
            <div className="card text-center py-14 text-muted">No lessons in this course yet.</div>
          )}

          {pct === 100 ? (
            <div className="alert alert-gold mt-4 items-center">
              <Icon name="trophy" size={22} />
              <div><strong className="text-inherit">Course complete!</strong> Your certificate has been issued — find it on your profile.</div>
            </div>
          ) : null}

          {course.description ? <p className="text-muted text-sm leading-relaxed mt-5">{course.description}</p> : null}
        </div>

        <aside>
          <div className="card-flat overflow-hidden lg:sticky lg:top-6">
            <div className="px-4 py-3 border-b hairline section-title">Lessons</div>
            <ol className="max-h-[60vh] overflow-y-auto">
              {course.videos.map((v, i) => {
                const isActive = activeVideo?.id === v.id
                const isDone = completed.has(v.id)
                return (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => setActiveVideo(v)}
                      aria-current={isActive ? 'true' : undefined}
                      className="w-full text-left flex items-center gap-3 px-4 py-3 border-b hairline transition-colors"
                      style={{ background: isActive ? 'var(--rs-primary-tint)' : undefined }}
                    >
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={isDone ? { background: 'var(--rs-success)', color: '#fff' } : isActive ? { background: 'var(--rs-primary)', color: 'var(--rs-primary-fg)' } : { background: 'var(--rs-surface-3)', color: 'var(--rs-muted)' }}
                      >
                        {isDone ? <Icon name="check" size={14} strokeWidth={2.6} /> : i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm truncate ${isActive ? 'text-primary font-semibold' : 'text-ink'}`}>{v.title}</span>
                        {v.duration ? <span className="block text-dim text-xs num">{v.duration}</span> : null}
                      </span>
                      {isActive ? <Icon name="play" size={14} className="text-primary" /> : null}
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  )
}
