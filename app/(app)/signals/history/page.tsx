import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SignalCard from '@/components/SignalCard'
import { PageHeader, EmptyState, SectionHeading } from '@/components/ui/states'

export const metadata: Metadata = { title: 'Signal history' }

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'tp', label: 'TP hit', status: 'HIT_TP' },
  { key: 'sl', label: 'SL hit', status: 'HIT_SL' },
  { key: 'closed', label: 'Closed', status: 'CLOSED' },
] as const

export default async function SignalHistoryPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f } = await searchParams
  const [closed, stats] = await Promise.all([
    prisma.signal.findMany({ where: { status: { in: ['HIT_TP', 'HIT_SL', 'CLOSED'] } }, orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.signalStat.findMany({ orderBy: { updatedAt: 'desc' }, take: 6 }),
  ])

  const tp = closed.filter((s) => s.status === 'HIT_TP').length
  const sl = closed.filter((s) => s.status === 'HIT_SL').length
  const wr = closed.length > 0 ? Math.round((tp / closed.length) * 100) : 0
  const active = FILTERS.find((x) => x.key === f) ?? FILTERS[0]
  const shown = 'status' in active ? closed.filter((s) => s.status === active.status) : closed
  const maxPips = Math.max(1, ...stats.map((s) => s.pipsGained))

  return (
    <div className="fade-in">
      <PageHeader title="Signal history" subtitle="Every closed signal from the last 50 trades, plus published monthly results." back={{ href: '/signals', label: 'Live signals' }} />

      <section className="grid grid-cols-3 gap-3 mb-8">
        <Tile label="Win rate" value={`${wr}%`} color="var(--rs-primary)" />
        <Tile label="TP hits" value={String(tp)} color="var(--rs-success-text)" />
        <Tile label="SL hits" value={String(sl)} color="var(--rs-danger-text)" />
      </section>

      {stats.length > 0 && (
        <section className="mb-8">
          <SectionHeading title="Monthly breakdown" />
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Month</th><th>Signals</th><th>Win rate</th><th>Pips gained</th><th>Pips lost</th><th className="w-[30%]">Gain profile</th></tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.id}>
                    <td className="text-ink font-semibold">{s.month}</td>
                    <td className="num">{s.totalSignals}</td>
                    <td className="num font-semibold text-primary">{s.winRate}%</td>
                    <td className="num" style={{ color: 'var(--rs-success-text)' }}>+{s.pipsGained}</td>
                    <td className="num" style={{ color: 'var(--rs-danger-text)' }}>-{s.pipsLost}</td>
                    <td>
                      <div className="progress"><span style={{ width: `${(s.pipsGained / maxPips) * 100}%`, background: 'var(--rs-success)' }} /></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section>
        <SectionHeading title="Closed signals" />
        <div className="flex gap-2 mb-4 scroll-x">
          {FILTERS.map((x) => (
            <Link key={x.key} href={x.key === 'all' ? '/signals/history' : `/signals/history?f=${x.key}`} className={`chip ${active.key === x.key ? 'chip-active' : ''}`}>{x.label}</Link>
          ))}
        </div>
        {shown.length === 0 ? (
          <EmptyState icon="history" title="No closed signals yet" description="Signals appear here as soon as they hit a target, stop or are closed." />
        ) : (
          <div className="flex flex-col gap-3">{shown.map((s) => <SignalCard key={s.id} signal={s} />)}</div>
        )}
      </section>
    </div>
  )
}

function Tile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="stat text-center">
      <div className="num text-2xl sm:text-3xl font-semibold" style={{ color }}>{value}</div>
      <div className="stat-label mt-1">{label}</div>
    </div>
  )
}
