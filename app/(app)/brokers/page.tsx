import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { PageHeader, EmptyState } from '@/components/ui/states'
import { Icon } from '@/components/brand/icons'
import { Button } from '@/components/ui/Button'
import { StarDisplay } from '@/components/StarRating'

export const metadata: Metadata = { title: 'Brokers' }

export default async function BrokersPage() {
  const brokers = await prisma.broker.findMany({ where: { isActive: true }, orderBy: [{ isRecommended: 'desc' }, { rating: 'desc' }] })

  return (
    <div className="fade-in">
      <PageHeader title="Recommended brokers" subtitle="Brokers our team has reviewed for spreads, execution and regulation." />

      <div className="alert alert-warning mb-6">
        <Icon name="info" size={16} />
        <span>Some links are affiliate links. Always do your own research — trading involves risk and you may lose more than you invest.</span>
      </div>

      {brokers.length === 0 ? (
        <EmptyState icon="building" title="Broker recommendations coming soon" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {brokers.map((b) => (
            <article key={b.id} className="card flex flex-col relative" style={b.isRecommended ? { borderColor: 'var(--rs-gold-line)' } : undefined}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center font-display font-extrabold text-lg shrink-0" style={{ background: 'var(--rs-surface-2)', color: 'var(--rs-ink)' }}>{b.name.charAt(0)}</span>
                  <div className="min-w-0">
                    <h2 className="text-ink font-bold text-lg truncate">{b.name}</h2>
                    <div className="flex items-center gap-1.5 mt-0.5"><StarDisplay rating={Math.round(b.rating)} size={13} /><span className="num text-muted text-xs">{b.rating.toFixed(1)}</span></div>
                  </div>
                </div>
                {b.isRecommended ? <span className="pill pill-gold shrink-0"><Icon name="award" size={11} /> Our pick</span> : null}
              </div>
              <p className="text-muted text-sm leading-relaxed mt-4 flex-1">{b.description}</p>
              <dl className="flex flex-wrap gap-2 mt-4">
                {b.minDeposit ? <div className="card-sub !py-1.5 !px-3 text-xs"><dt className="inline text-dim">Min deposit </dt><dd className="inline num text-ink font-semibold">{b.minDeposit}</dd></div> : null}
                {b.regulation ? <div className="card-sub !py-1.5 !px-3 text-xs inline-flex items-center gap-1"><Icon name="shieldCheck" size={13} className="text-success-text" /><dd className="text-ink font-semibold">{b.regulation}</dd></div> : null}
              </dl>
              <div className="mt-5"><Button href={b.link} external block iconRight="external">Open account</Button></div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
