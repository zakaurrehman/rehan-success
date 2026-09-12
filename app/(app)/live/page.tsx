import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatDateTime } from '@/lib/utils'
import { PageHeader, EmptyState } from '@/components/ui/states'
import { Icon } from '@/components/brand/icons'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = { title: 'Live sessions' }

export default async function LivePage() {
  const now = new Date()
  const [liveSessions, upcoming] = await Promise.all([
    prisma.liveSession.findMany({ where: { isLive: true }, orderBy: { scheduledAt: 'desc' } }),
    prisma.liveSession.findMany({ where: { isLive: false, scheduledAt: { gte: now } }, orderBy: { scheduledAt: 'asc' }, take: 10 }),
  ])

  return (
    <div className="fade-in max-w-3xl">
      <PageHeader title="Live sessions" subtitle="Watch the market analysed in real time and ask your questions." />

      {liveSessions.map((session) => (
        <section key={session.id} className="rounded-2xl p-6 mb-4 border relative overflow-hidden" style={{ background: 'var(--rs-danger-tint)', borderColor: 'var(--rs-danger-line)' }}>
          <span className="pill pill-solid-danger"><span className="w-1.5 h-1.5 rounded-full bg-white live-dot" /> LIVE NOW</span>
          <h2 className="text-ink text-xl font-bold mt-3">{session.title}</h2>
          {session.description ? <p className="text-text text-sm mt-1.5 leading-relaxed">{session.description}</p> : null}
          {session.streamUrl ? (
            <div className="mt-5"><Button href={session.streamUrl} external variant="danger" icon="play">Join the stream</Button></div>
          ) : (
            <p className="text-muted text-sm mt-4">Stream link will be shared shortly.</p>
          )}
        </section>
      ))}

      {liveSessions.length === 0 ? (
        <div className="card-flat flex items-center gap-4 p-5 mb-6">
          <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--rs-surface-2)', color: 'var(--rs-dim)' }}><Icon name="radio" size={20} /></span>
          <div>
            <div className="text-ink font-semibold">No live session right now</div>
            <div className="text-muted text-sm">You’ll get a notification the moment a session starts.</div>
          </div>
        </div>
      ) : null}

      <h2 className="section-title mb-3">Upcoming</h2>
      {upcoming.length === 0 ? (
        <EmptyState compact icon="calendar" title="No sessions scheduled" description="New sessions are announced here and in your notifications." />
      ) : (
        <ol className="flex flex-col gap-3">
          {upcoming.map((s) => {
            const diff = s.scheduledAt.getTime() - now.getTime()
            const days = Math.floor(diff / 86400000)
            const hours = Math.floor((diff % 86400000) / 3600000)
            const mins = Math.floor((diff % 3600000) / 60000)
            const countdown = days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
            const d = s.scheduledAt
            return (
              <li key={s.id} className="card-flat flex items-center gap-4 p-4" style={{ boxShadow: 'var(--rs-shadow-xs)' }}>
                <div className="w-14 text-center shrink-0 rounded-xl py-2" style={{ background: 'var(--rs-primary-tint)' }}>
                  <div className="text-[11px] font-bold uppercase text-primary">{d.toLocaleString('en-US', { month: 'short' })}</div>
                  <div className="num text-ink text-xl font-semibold leading-none mt-0.5">{d.getDate()}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-ink font-semibold truncate">{s.title}</h3>
                  {s.description ? <p className="text-muted text-sm truncate">{s.description}</p> : null}
                  <div className="text-dim text-xs mt-0.5">{formatDateTime(s.scheduledAt)}</div>
                </div>
                <span className="pill pill-primary shrink-0"><Icon name="clock" size={11} /> in {countdown}</span>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
