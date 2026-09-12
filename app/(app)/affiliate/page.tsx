import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { APP_URL } from '@/lib/site'
import CopyButton from '@/components/CopyButton'
import { PageHeader, StatTile, StatusPill, EmptyState, SectionHeading } from '@/components/ui/states'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/brand/icons'

export const metadata: Metadata = { title: 'Affiliate' }

export default async function AffiliatePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      commissions: true,
      sales: { orderBy: { createdAt: 'desc' }, take: 5 },
      withdrawals: { orderBy: { createdAt: 'desc' }, take: 3 },
    },
  })
  if (!user) redirect('/login')

  const totalEarned = user.commissions.reduce((s, c) => s + c.amount, 0)
  const available = user.commissions.filter((c) => !c.withdrawn).reduce((s, c) => s + c.amount, 0)
  const withdrawn = user.commissions.filter((c) => c.withdrawn).reduce((s, c) => s + c.amount, 0)
  const refLink = user.referralCode ? `${APP_URL}/api/ref/${user.referralCode}` : null

  return (
    <div className="fade-in">
      <PageHeader
        title="Affiliate dashboard"
        subtitle="Earn 50% commission on every plan purchased through your link."
        actions={<Button href="/affiliate/withdraw" icon="wallet" variant="primary" size="sm">Withdraw</Button>}
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatTile label="Available" value={formatCurrency(available)} icon="wallet" tone="success" href="/affiliate/withdraw" />
        <StatTile label="Total earned" value={formatCurrency(totalEarned)} icon="trendingUp" tone="primary" />
        <StatTile label="Withdrawn" value={formatCurrency(withdrawn)} icon="check" />
        <StatTile label="Sales referred" value={String(user.commissions.length)} icon="users" hint={`${user.commissions.length} commission records`} href="/affiliate/commissions" />
      </section>

      <section className="card mb-6">
        <div className="flex items-center gap-2 mb-1"><Icon name="link" size={17} className="text-primary" /><h2 className="text-base font-bold">Your referral link</h2></div>
        {refLink ? (
          <>
            <p className="text-muted text-sm">Visitors who open this link are tagged to you for 30 days.</p>
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <code className="field num !text-sm flex items-center overflow-x-auto whitespace-nowrap select-all" style={{ background: 'var(--rs-surface-2)' }}>{refLink}</code>
              <CopyButton text={refLink} />
            </div>
            <p className="text-dim text-xs mt-3">Referral code: <span className="num text-ink font-semibold">{user.referralCode}</span> — buyers can also enter it at checkout.</p>
          </>
        ) : (
          <div className="alert alert-warning mt-3"><Icon name="clock" size={16} /><span>Your referral link is activated once your account is approved.</span></div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <SectionHeading title="Recent sales" action={<Link href="/affiliate/commissions" className="link text-sm">All commissions</Link>} />
          {user.sales.length ? (
            <ul className="card-flat">
              {user.sales.map((s, i) => (
                <li key={s.id} className={`flex items-center justify-between gap-3 px-4 py-3 ${i ? 'border-t hairline' : ''}`}>
                  <div className="min-w-0">
                    <div className="text-ink text-sm font-semibold truncate">{s.clientName}</div>
                    <div className="text-dim text-xs">{formatDate(s.createdAt)} · Sale {formatCurrency(s.amount)}</div>
                  </div>
                  <span className="num text-sm font-semibold" style={{ color: 'var(--rs-success-text)' }}>+{formatCurrency(s.amount * 0.5)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState compact icon="users" title="No sales yet" description="Share your link to start earning." />
          )}
        </section>

        <section>
          <SectionHeading title="Recent withdrawals" action={<Link href="/affiliate/withdraw" className="link text-sm">Request payout</Link>} />
          {user.withdrawals.length ? (
            <ul className="card-flat">
              {user.withdrawals.map((w, i) => (
                <li key={w.id} className={`flex items-center justify-between gap-3 px-4 py-3 ${i ? 'border-t hairline' : ''}`}>
                  <div>
                    <div className="num text-ink text-sm font-semibold">{formatCurrency(w.amount)}</div>
                    <div className="text-dim text-xs">{formatDate(w.createdAt)}</div>
                  </div>
                  <StatusPill status={w.status} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState compact icon="wallet" title="No withdrawal requests" />
          )}
        </section>
      </div>
    </div>
  )
}
