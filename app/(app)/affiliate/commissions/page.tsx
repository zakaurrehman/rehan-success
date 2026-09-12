import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PageHeader, EmptyState } from '@/components/ui/states'

export const metadata: Metadata = { title: 'Commissions' }

export default async function CommissionsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const commissions = await prisma.commission.findMany({
    where: { affiliateId: session.user.id },
    include: { sale: true },
    orderBy: { createdAt: 'desc' },
  })
  const total = commissions.reduce((s, c) => s + c.amount, 0)

  return (
    <div className="fade-in">
      <PageHeader
        title="Commissions"
        subtitle={commissions.length ? `${commissions.length} record${commissions.length === 1 ? '' : 's'} · ${formatCurrency(total)} total` : undefined}
        back={{ href: '/affiliate', label: 'Affiliate' }}
      />

      {commissions.length === 0 ? (
        <EmptyState icon="dollar" title="No commissions yet" description="Share your referral link to start earning 50% on every sale." />
      ) : (
        <>
          {/* Desktop table */}
          <div className="table-wrap hidden sm:block">
            <table className="table">
              <thead><tr><th>Client</th><th>Date</th><th className="text-right">Sale</th><th className="text-right">Commission</th><th>Status</th></tr></thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c.id}>
                    <td className="text-ink font-semibold">{c.sale.clientName}</td>
                    <td className="text-muted">{formatDate(c.createdAt)}</td>
                    <td className="num text-right">{formatCurrency(c.sale.amount)}</td>
                    <td className="num text-right font-semibold" style={{ color: 'var(--rs-success-text)' }}>{formatCurrency(c.amount)}</td>
                    <td><span className={`pill ${c.withdrawn ? 'pill-neutral' : 'pill-success'}`}>{c.withdrawn ? 'Paid out' : 'Available'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <ul className="sm:hidden card-flat">
            {commissions.map((c, i) => (
              <li key={c.id} className={`flex items-center justify-between gap-3 px-4 py-3.5 ${i ? 'border-t hairline' : ''}`}>
                <div className="min-w-0">
                  <div className="text-ink text-sm font-semibold truncate">{c.sale.clientName}</div>
                  <div className="text-dim text-xs">{formatDate(c.createdAt)} · Sale {formatCurrency(c.sale.amount)}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="num text-sm font-semibold" style={{ color: 'var(--rs-success-text)' }}>{formatCurrency(c.amount)}</div>
                  <span className={`pill mt-1 ${c.withdrawn ? 'pill-neutral' : 'pill-success'}`}>{c.withdrawn ? 'Paid out' : 'Available'}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
