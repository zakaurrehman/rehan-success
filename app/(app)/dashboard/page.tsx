import type { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDateTime, timeAgo } from '@/lib/utils'
import { Icon, type IconName } from '@/components/brand/icons'
import SignalCard from '@/components/SignalCard'
import { EmptyState, SectionHeading } from '@/components/ui/states'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = { title: 'Overview' }

const QUICK: { href: string; label: string; icon: IconName }[] = [
  { href: '/signals', label: 'Signals', icon: 'bolt' },
  { href: '/watchlist', label: 'Markets', icon: 'trendingUp' },
  { href: '/calculator', label: 'Risk calc', icon: 'calculator' },
  { href: '/calendar', label: 'Calendar', icon: 'calendar' },
  { href: '/classroom', label: 'Classroom', icon: 'graduation' },
  { href: '/affiliate', label: 'Affiliate', icon: 'gift' },
]

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id
  const now = new Date()

  const [
    activeSignals, activeCount, stat, commissions, liveNow, nextSession, events, posts, notifications, videoCount, doneCount, certCount,
  ] = await Promise.all([
    prisma.signal.findMany({ where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' }, take: 3 }),
    prisma.signal.count({ where: { status: 'ACTIVE' } }),
    prisma.signalStat.findFirst({ orderBy: { updatedAt: 'desc' } }),
    prisma.commission.findMany({ where: { affiliateId: userId }, select: { amount: true, withdrawn: true } }),
    prisma.liveSession.findFirst({ where: { isLive: true }, orderBy: { scheduledAt: 'desc' } }),
    prisma.liveSession.findFirst({ where: { isLive: false, scheduledAt: { gte: now } }, orderBy: { scheduledAt: 'asc' } }),
    prisma.economicEvent.findMany({ where: { eventTime: { gte: now } }, orderBy: { eventTime: 'asc' }, take: 4 }),
    prisma.researchPost.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' }, take: 3, select: { id: true, title: true, category: true, createdAt: true, isPremium: true } }),
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 3 }),
    prisma.video.count(),
    prisma.courseProgress.count({ where: { userId } }),
    prisma.certificate.count({ where: { userId } }),
  ])

  const available = commissions.filter((c) => !c.withdrawn).reduce((s, c) => s + c.amount, 0)
  const totalEarned = commissions.reduce((s, c) => s + c.amount, 0)
  const learnPct = videoCount > 0 ? Math.min(100, Math.round((doneCount / videoCount) * 100)) : 0
  const firstName = (session!.user.name || 'Trader').split(' ')[0]
  const plan = session!.user.plan
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <p className="text-muted text-sm">{greeting},</p>
          <h1 className="page-title">{firstName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={`pill ${plan === 'FREE' ? 'pill-neutral' : 'pill-gold'}`}><Icon name="award" size={12} /> {plan} plan</span>
          {plan === 'FREE' ? <Button href="/order" size="sm" variant="primary" icon="sparkles">Upgrade</Button> : null}
        </div>
      </div>

      {liveNow ? (
        <Link href="/live" className="alert alert-danger mb-5 no-underline items-center">
          <span className="w-2.5 h-2.5 rounded-full live-dot shrink-0" style={{ background: 'var(--rs-danger)' }} />
          <span className="flex-1"><strong className="text-inherit">Live now:</strong> {liveNow.title}</span>
          <Icon name="arrowRight" size={16} />
        </Link>
      ) : null}

      {/* ── Hero metrics ── */}
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] mb-6">
        <div className="rounded-[1.25rem] p-6 relative overflow-hidden text-white" style={{ background: 'linear-gradient(140deg, #0f766e 0%, #0b3f3b 55%, #0b1020 100%)', boxShadow: 'var(--rs-shadow-md)' }}>
          <div aria-hidden className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(94,234,212,0.35), transparent 65%)' }} />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm font-medium">Signal performance{stat ? ` · ${stat.month}` : ''}</span>
              <Link href="/signals/history" className="text-white/80 hover:text-white text-xs font-semibold inline-flex items-center gap-1">History <Icon name="chevronRight" size={14} /></Link>
            </div>
            {stat ? (
              <>
                <div className="flex items-end gap-3 mt-3">
                  <span className="num text-5xl font-semibold tracking-tight">{stat.winRate}%</span>
                  <span className="text-white/70 text-sm mb-2">win rate</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/15 mt-4 overflow-hidden"><span className="block h-full rounded-full" style={{ width: `${Math.min(100, stat.winRate)}%`, background: '#5eead4' }} /></div>
                <dl className="grid grid-cols-3 gap-3 mt-5">
                  <HeroStat label="Pips gained" value={`+${stat.pipsGained}`} />
                  <HeroStat label="Pips lost" value={`-${stat.pipsLost}`} />
                  <HeroStat label="Signals" value={String(stat.totalSignals)} />
                </dl>
              </>
            ) : (
              <p className="text-white/75 text-sm mt-4">Monthly performance will appear here once results are published.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Metric href="/signals" icon="bolt" label="Active signals" value={String(activeCount)} tone="success" hint={activeCount ? 'Open now' : 'None open'} />
          <Metric href="/affiliate/withdraw" icon="wallet" label="Available balance" value={formatCurrency(available)} tone="gold" hint={`${formatCurrency(totalEarned)} earned`} />
          <Metric href="/classroom" icon="graduation" label="Course progress" value={`${learnPct}%`} tone="primary" hint={`${certCount} certificate${certCount === 1 ? '' : 's'}`} />
          <Metric href="/notifications" icon="bell" label="Alerts" value={String(notifications.filter((n) => !n.read).length)} tone="neutral" hint="Unread" />
        </div>
      </section>

      {/* ── Quick actions ── */}
      <nav className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 mb-8" aria-label="Quick actions">
        {QUICK.map((q) => (
          <Link key={q.href} href={q.href} className="card-flat card-hover flex flex-col items-center gap-2 py-3.5 no-underline">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--rs-primary-tint)', color: 'var(--rs-primary)' }}><Icon name={q.icon} size={18} /></span>
            <span className="text-text text-xs font-semibold">{q.label}</span>
          </Link>
        ))}
      </nav>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* ── Active signals ── */}
        <section>
          <SectionHeading title="Open signals" action={<Link href="/signals" className="link text-sm">View desk</Link>} />
          {activeSignals.length ? (
            <div className="flex flex-col gap-3">
              {activeSignals.map((s) => <SignalCard key={s.id} signal={s} compact />)}
            </div>
          ) : (
            <EmptyState compact icon="bolt" title="No open signals right now" description="New setups are pushed here the moment they’re published." action={<Button href="/signals/history" variant="secondary" size="sm">Review past signals</Button>} />
          )}

          <div className="mt-8">
            <SectionHeading title="Latest research" action={<Link href="/research" className="link text-sm">All research</Link>} />
            {posts.length ? (
              <ul className="card-flat divide-y" style={{ borderColor: 'var(--rs-line)' }}>
                {posts.map((p) => (
                  <li key={p.id} style={{ borderColor: 'var(--rs-line)' }}>
                    <Link href={`/research/${p.id}`} className="flex items-center gap-3 px-4 py-3.5 no-underline hover:bg-[var(--rs-surface-2)] transition-colors">
                      <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--rs-surface-2)', color: 'var(--rs-muted)' }}><Icon name="fileText" size={17} /></span>
                      <div className="min-w-0 flex-1">
                        <div className="text-ink text-sm font-semibold truncate">{p.title}</div>
                        <div className="text-dim text-xs mt-0.5">{p.category} · {timeAgo(p.createdAt)}</div>
                      </div>
                      {p.isPremium ? <span className="pill pill-gold">Premium</span> : null}
                      <Icon name="chevronRight" size={16} className="text-faint" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact icon="fileText" title="No research published yet" />
            )}
          </div>
        </section>

        {/* ── Side column ── */}
        <aside className="flex flex-col gap-8">
          <section>
            <SectionHeading title="Upcoming events" action={<Link href="/calendar" className="link text-sm">Calendar</Link>} />
            {events.length ? (
              <ul className="card-flat">
                {events.map((e, i) => (
                  <li key={e.id} className={`flex items-center gap-3 px-4 py-3 ${i ? 'border-t hairline' : ''}`}>
                    <span className={`pill ${e.impact === 'HIGH' ? 'pill-danger' : e.impact === 'MEDIUM' ? 'pill-warning' : 'pill-success'} w-[62px] justify-center`}>{e.impact}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-ink text-sm font-semibold truncate">{e.name}</div>
                      <div className="text-dim text-xs">{e.currency} · {formatDateTime(e.eventTime)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact icon="calendar" title="No upcoming events" />
            )}
          </section>

          <section>
            <SectionHeading title="Next live session" />
            {nextSession ? (
              <Link href="/live" className="card card-hover block no-underline">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--rs-primary-tint)', color: 'var(--rs-primary)' }}><Icon name="radio" size={19} /></span>
                  <div className="min-w-0">
                    <div className="text-ink font-semibold truncate">{nextSession.title}</div>
                    <div className="text-muted text-xs mt-0.5">{formatDateTime(nextSession.scheduledAt)}</div>
                  </div>
                </div>
              </Link>
            ) : (
              <EmptyState compact icon="radio" title="No sessions scheduled" />
            )}
          </section>

          <section>
            <SectionHeading title="Recent activity" action={<Link href="/notifications" className="link text-sm">All</Link>} />
            {notifications.length ? (
              <ul className="card-flat">
                {notifications.map((n, i) => (
                  <li key={n.id} className={`px-4 py-3 ${i ? 'border-t hairline' : ''}`}>
                    <div className="flex items-center gap-2">
                      {!n.read ? <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--rs-primary)' }} /> : null}
                      <span className="text-ink text-sm font-semibold truncate flex-1">{n.title}</span>
                      <span className="text-dim text-xs shrink-0">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-muted text-xs mt-1 line-clamp-2">{n.message}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact icon="bell" title="You’re all caught up" />
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
      <dt className="text-white/60 text-[11px]">{label}</dt>
      <dd className="num text-white font-semibold text-base mt-0.5">{value}</dd>
    </div>
  )
}

function Metric({ href, icon, label, value, hint, tone }: { href: string; icon: IconName; label: string; value: string; hint: string; tone: 'success' | 'gold' | 'primary' | 'neutral' }) {
  const c = { success: ['var(--rs-success-tint)', 'var(--rs-success-text)'], gold: ['var(--rs-gold-tint)', 'var(--rs-gold-text)'], primary: ['var(--rs-primary-tint)', 'var(--rs-primary)'], neutral: ['var(--rs-surface-2)', 'var(--rs-muted)'] }[tone]
  return (
    <Link href={href} className="stat card-hover flex flex-col no-underline">
      <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c[0], color: c[1] }}><Icon name={icon} size={16} /></span>
      <span className="stat-label mt-3">{label}</span>
      <span className="num text-ink text-xl font-semibold mt-0.5 truncate">{value}</span>
      <span className="text-dim text-xs mt-0.5">{hint}</span>
    </Link>
  )
}
