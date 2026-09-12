import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Icon, type IconName } from '@/components/brand/icons'
import { PageHeader, StatTile, EmptyState, SectionHeading } from '@/components/ui/states'

export const dynamic = 'force-dynamic'

export default async function AdminOverviewPage() {
  const [users, sales, commissions, withdrawals, reviews, signals, affiliates, pendingPayments, recentSales] = await Promise.all([
    prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
    prisma.sale.aggregate({ _sum: { amount: true }, _count: true }),
    prisma.commission.aggregate({ _sum: { amount: true } }),
    prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
    prisma.review.count({ where: { status: 'PENDING' } }),
    prisma.signal.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { role: 'AFFILIATE', status: 'PENDING' } }),
    prisma.paymentRequest.count({ where: { status: 'PENDING' } }),
    prisma.sale.findMany({ include: { affiliate: { select: { fullName: true } } }, orderBy: { createdAt: 'desc' }, take: 8 }),
  ])

  const queue: { label: string; count: number; href: string; icon: IconName; cta: string }[] = [
    { label: 'Payments awaiting confirmation', count: pendingPayments, href: '/admin/payments', icon: 'card', cta: 'Review payments' },
    { label: 'Withdrawal requests', count: withdrawals, href: '/admin/withdrawals', icon: 'wallet', cta: 'Process payouts' },
    { label: 'Affiliate applications', count: affiliates, href: '/admin/affiliates', icon: 'gift', cta: 'Review applicants' },
    { label: 'Reviews to moderate', count: reviews, href: '/admin/reviews', icon: 'star', cta: 'Moderate' },
  ]
  const actionable = queue.filter((q) => q.count > 0)

  return (
    <div className="fade-in">
      <PageHeader title="Admin dashboard" subtitle="Rehan Success platform at a glance." />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatTile label="Total revenue" value={formatCurrency(sales._sum.amount || 0)} icon="dollar" tone="primary" hint={`${sales._count} sales`} href="/admin/sales" />
        <StatTile label="Commissions owed & paid" value={formatCurrency(commissions._sum.amount || 0)} icon="trendingUp" tone="gold" href="/admin/withdrawals" />
        <StatTile label="Members" value={users.toLocaleString()} icon="users" href="/admin/users" />
        <StatTile label="Active signals" value={signals} icon="bolt" tone="success" href="/admin/signals" />
      </section>

      <section className="mb-8">
        <SectionHeading title="Needs your attention" />
        {actionable.length === 0 ? (
          <div className="alert alert-success"><Icon name="checkCircle" size={16} /><span>Everything is up to date — no pending payments, payouts, applications or reviews.</span></div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {queue.map((q) => (
              <Link key={q.href} href={q.href} className="card-flat card-hover flex items-center gap-4 p-4 no-underline" style={q.count ? { borderColor: 'var(--rs-warning-line)' } : undefined}>
                <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: q.count ? 'var(--rs-warning-tint)' : 'var(--rs-surface-2)', color: q.count ? 'var(--rs-warning-text)' : 'var(--rs-dim)' }}><Icon name={q.icon} size={20} /></span>
                <div className="min-w-0 flex-1">
                  <div className="num text-ink text-xl font-semibold">{q.count}</div>
                  <div className="text-muted text-sm">{q.label}</div>
                </div>
                <span className="text-primary text-sm font-semibold hidden sm:inline-flex items-center gap-1">{q.cta} <Icon name="arrowRight" size={15} /></span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeading title="Recent sales" action={<Link href="/admin/sales" className="link text-sm">Log a sale</Link>} />
        {recentSales.length === 0 ? (
          <EmptyState compact icon="trendingUp" title="No sales yet" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Client</th><th>Affiliate</th><th className="text-right">Amount</th><th className="text-right">Commission</th><th>Date</th></tr></thead>
              <tbody>
                {recentSales.map((s) => (
                  <tr key={s.id}>
                    <td className="text-ink font-semibold">{s.clientName}</td>
                    <td className="text-muted">{s.affiliate.fullName}</td>
                    <td className="num text-right text-ink">{formatCurrency(s.amount)}</td>
                    <td className="num text-right" style={{ color: 'var(--rs-success-text)' }}>{formatCurrency(s.amount * 0.5)}</td>
                    <td className="text-dim">{formatDate(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
