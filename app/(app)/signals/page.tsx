import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SignalCard from '@/components/SignalCard'
import { PageHeader, EmptyState } from '@/components/ui/states'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/brand/icons'

export const metadata: Metadata = { title: 'Live signals' }

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'buy', label: 'Buy' },
  { key: 'sell', label: 'Sell' },
]

export default async function SignalsPage({ searchParams }: { searchParams: Promise<{ dir?: string }> }) {
  const { dir } = await searchParams
  const [activeSignals, stats] = await Promise.all([
    prisma.signal.findMany({ where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } }),
    prisma.signalStat.findFirst({ orderBy: { updatedAt: 'desc' } }),
  ])

  const current = dir === 'buy' || dir === 'sell' ? dir : 'all'
  const shown = activeSignals.filter((s) => current === 'all' || s.direction === current.toUpperCase())
  const buys = activeSignals.filter((s) => s.direction === 'BUY').length

  return (
    <div className="fade-in">
      <PageHeader
        title="Live signals"
        subtitle={
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full live-dot" style={{ background: 'var(--rs-success)' }} />
            {activeSignals.length} open signal{activeSignals.length === 1 ? '' : 's'} · updated in real time
          </span>
        }
        actions={<Button href="/signals/history" variant="secondary" size="sm" icon="history">History</Button>}
      />

      {/* Performance strip */}
      <section className="card !p-0 overflow-hidden mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0" style={{ borderColor: 'var(--rs-line)' }}>
          <Strip label={stats ? `Win rate · ${stats.month}` : 'Win rate'} value={stats ? `${stats.winRate}%` : '—'} tone="primary" />
          <Strip label="Pips gained" value={stats ? `+${stats.pipsGained}` : '—'} tone="success" />
          <Strip label="Signals this month" value={stats ? String(stats.totalSignals) : '—'} />
          <Strip label="Open bias" value={activeSignals.length ? `${buys} buy · ${activeSignals.length - buys} sell` : '—'} small />
        </div>
      </section>

      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex gap-2" role="tablist" aria-label="Filter by direction">
          {FILTERS.map((f) => (
            <Link key={f.key} href={f.key === 'all' ? '/signals' : `/signals?dir=${f.key}`} className={`chip ${current === f.key ? 'chip-active' : ''}`} aria-current={current === f.key ? 'page' : undefined}>
              {f.label}
            </Link>
          ))}
        </div>
        <Link href="/calculator" className="link text-sm inline-flex items-center gap-1"><Icon name="calculator" size={15} /> Size a trade</Link>
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon="clock"
          title={activeSignals.length ? 'No signals match this filter' : 'No open signals right now'}
          description="We publish setups only when the market offers one. You’ll get a notification the moment a new signal goes live."
          action={<Button href="/signals/history" variant="secondary" size="sm">View signal history</Button>}
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-1">
          {shown.map((s) => <SignalCard key={s.id} signal={s} />)}
        </div>
      )}

      <p className="text-dim text-xs leading-relaxed mt-8">Signals are trade ideas for education only. Always use a stop loss and never risk more than you can afford to lose.</p>
    </div>
  )
}

function Strip({ label, value, tone, small }: { label: string; value: string; tone?: 'primary' | 'success'; small?: boolean }) {
  return (
    <div className="px-5 py-4" style={{ borderColor: 'var(--rs-line)' }}>
      <div className="text-dim text-xs font-medium">{label}</div>
      <div className={`font-semibold mt-1 ${small ? 'text-base text-ink' : 'num text-2xl'}`} style={{ color: tone === 'primary' ? 'var(--rs-primary)' : tone === 'success' ? 'var(--rs-success-text)' : undefined }}>{value}</div>
    </div>
  )
}
