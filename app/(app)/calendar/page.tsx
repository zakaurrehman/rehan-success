import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PageHeader, EmptyState } from '@/components/ui/states'

export const metadata: Metadata = { title: 'Economic calendar' }

type Impact = 'HIGH' | 'MEDIUM' | 'LOW'
type Ev = { id: string; name: string; currency: string; impact: Impact; eventTime: Date; actual: string | null; forecast: string | null; previous: string | null }

const IMPACT_CLS: Record<Impact, string> = { HIGH: 'pill-danger', MEDIUM: 'pill-warning', LOW: 'pill-success' }
const IMPACT_BAR: Record<Impact, string> = { HIGH: 'var(--rs-danger)', MEDIUM: 'var(--rs-warning)', LOW: 'var(--rs-success)' }

function dayKey(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ impact?: string }> }) {
  const { impact } = await searchParams
  const now = new Date()
  const events = (await prisma.economicEvent.findMany({
    where: { eventTime: { gte: new Date(now.getTime() - 7 * 86400000) } },
    orderBy: { eventTime: 'asc' },
    take: 50,
  })) as Ev[]

  const filter = impact === 'HIGH' || impact === 'MEDIUM' || impact === 'LOW' ? impact : null
  const visible = filter ? events.filter((e) => e.impact === filter) : events
  const upcoming = visible.filter((e) => e.eventTime >= now)
  const past = visible.filter((e) => e.eventTime < now).reverse()

  const group = (list: Ev[]) => {
    const map = new Map<string, Ev[]>()
    list.forEach((e) => { const k = dayKey(e.eventTime); map.set(k, [...(map.get(k) || []), e]) })
    return Array.from(map.entries())
  }

  return (
    <div className="fade-in">
      <PageHeader title="Economic calendar" subtitle="High-impact releases that move Forex and Gold. Times shown in server time." />

      <div className="flex gap-2 mb-6 scroll-x">
        {[{ k: null, l: 'All impact' }, { k: 'HIGH', l: 'High' }, { k: 'MEDIUM', l: 'Medium' }, { k: 'LOW', l: 'Low' }].map((f) => (
          <Link key={f.l} href={f.k ? `/calendar?impact=${f.k}` : '/calendar'} className={`chip ${filter === f.k ? 'chip-active' : ''}`}>
            {f.k ? <span className="w-2 h-2 rounded-full" style={{ background: IMPACT_BAR[f.k as Impact] }} /> : null}{f.l}
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon="calendar" title="No events to show" description="Upcoming releases are added by our team each week." />
      ) : (
        <div className="flex flex-col gap-8">
          {upcoming.length > 0 && <EventGroups title="Upcoming" groups={group(upcoming)} />}
          {past.length > 0 && <EventGroups title="Past 7 days" groups={group(past)} past />}
        </div>
      )}
    </div>
  )
}

function EventGroups({ title, groups, past }: { title: string; groups: [string, Ev[]][]; past?: boolean }) {
  return (
    <section>
      <h2 className="section-title mb-3">{title}</h2>
      <div className="flex flex-col gap-4">
        {groups.map(([day, list]) => (
          <div key={day} className="card-flat overflow-hidden" style={{ opacity: past ? 0.9 : 1 }}>
            <div className="px-4 py-2.5 text-xs font-semibold text-muted border-b hairline" style={{ background: 'var(--rs-surface-2)' }}>{day}</div>
            <ul>
              {list.map((e, i) => (
                <li key={e.id} className={`grid grid-cols-[52px_minmax(0,1fr)] sm:grid-cols-[64px_72px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-4 py-3 ${i ? 'border-t hairline' : ''}`}>
                  <span className="num text-ink text-sm font-semibold">{e.eventTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                  <span className="hidden sm:flex items-center gap-2">
                    <span className="w-1 h-6 rounded-full" style={{ background: IMPACT_BAR[e.impact] }} />
                    <span className="num text-ink text-sm font-semibold">{e.currency}</span>
                  </span>
                  <div className="min-w-0">
                    <div className="text-ink text-sm font-semibold">{e.name}</div>
                    <div className="flex items-center gap-2 mt-1 sm:hidden">
                      <span className={`pill ${IMPACT_CLS[e.impact]}`}>{e.impact}</span>
                      <span className="num text-muted text-xs font-semibold">{e.currency}</span>
                    </div>
                  </div>
                  <dl className="col-span-2 sm:col-span-1 flex gap-4 text-xs sm:justify-end">
                    <div><dt className="text-dim">Actual</dt><dd className="num font-semibold" style={{ color: e.actual ? 'var(--rs-success-text)' : 'var(--rs-faint)' }}>{e.actual || '—'}</dd></div>
                    <div><dt className="text-dim">Forecast</dt><dd className="num text-text font-semibold">{e.forecast || '—'}</dd></div>
                    <div><dt className="text-dim">Previous</dt><dd className="num text-muted">{e.previous || '—'}</dd></div>
                  </dl>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
