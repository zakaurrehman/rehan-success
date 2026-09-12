import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Icon, type IconName } from '@/components/brand/icons'
import { Button } from '@/components/ui/Button'
import ProfileActions from './ProfileActions'

export const metadata: Metadata = { title: 'Profile' }

const LINKS: { href: string; label: string; sub: string; icon: IconName }[] = [
  { href: '/affiliate', label: 'Affiliate dashboard', sub: 'Referrals, commissions & payouts', icon: 'gift' },
  { href: '/notifications', label: 'Notifications', sub: 'Account and payout alerts', icon: 'bell' },
  { href: '/calculator', label: 'Risk calculator', sub: 'Position-size tool', icon: 'calculator' },
  { href: '/brokers', label: 'Brokers', sub: 'Reviewed broker list', icon: 'building' },
  { href: '/reviews', label: 'Leave a review', sub: 'Share your experience', icon: 'star' },
]

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      certificates: { include: { course: { select: { title: true, level: true } } } },
      commissions: { select: { amount: true, withdrawn: true } },
      sales: { select: { id: true } },
    },
  })
  if (!user) redirect('/login')

  const totalEarned = user.commissions.reduce((s, c) => s + c.amount, 0)
  const details: [string, string][] = [
    ['Email', user.email],
    ['Username', `@${user.username}`],
    ['Member ID', user.studentId],
    ['Phone', user.phone || '—'],
    ['Country', user.country || '—'],
    ['Payout method', user.paymentMethod || '—'],
    ['Member since', formatDate(user.createdAt)],
  ]

  return (
    <div className="fade-in">
      {/* Identity */}
      <section className="card !p-0 overflow-hidden mb-6">
        <div className="h-24 sm:h-28" style={{ background: 'linear-gradient(120deg, #0f766e, #0b3f3b 60%, #0b1020)' }} />
        <div className="px-5 sm:px-6 pb-5 flex flex-wrap items-start gap-4">
          <span className="-mt-10 w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-extrabold font-display shrink-0" style={{ background: 'var(--rs-surface)', color: 'var(--rs-primary)', border: '4px solid var(--rs-surface)', boxShadow: 'var(--rs-shadow-md)' }}>
            {user.fullName.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1 pt-3">
            <h1 className="text-2xl font-extrabold truncate">{user.fullName}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`pill ${user.plan === 'FREE' ? 'pill-neutral' : 'pill-gold'}`}><Icon name="award" size={11} /> {user.plan} plan</span>
              <span className="pill pill-neutral">{user.role === 'AFFILIATE' ? 'Affiliate' : 'Member'}</span>
            </div>
          </div>
          {user.plan === 'FREE' ? <div className="pt-3"><Button href="/order" icon="sparkles">Upgrade plan</Button></div> : null}
        </div>
        <dl className="grid grid-cols-3 border-t hairline">
          {[
            { label: 'Sales referred', value: String(user.sales.length) },
            { label: 'Total earned', value: formatCurrency(totalEarned) },
            { label: 'Certificates', value: String(user.certificates.length) },
          ].map((s, i) => (
            <div key={s.label} className={`px-4 py-4 text-center ${i ? 'border-l hairline' : ''}`}>
              <dd className="num text-ink text-lg sm:text-xl font-semibold">{s.value}</dd>
              <dt className="text-dim text-xs mt-0.5">{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <section className="card">
            <h2 className="text-base font-bold mb-2">Account details</h2>
            <dl>
              {details.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5 border-b hairline last:border-0">
                  <dt className="text-muted text-sm">{label}</dt>
                  <dd className="text-ink text-sm font-medium text-right truncate">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-dim text-xs mt-3">Need to change your details? Contact support.</p>
          </section>

          <section className="card">
            <h2 className="text-base font-bold mb-3">Certificates</h2>
            {user.certificates.length ? (
              <ul className="flex flex-col gap-2.5">
                {user.certificates.map((c) => (
                  <li key={c.id} className="card-sub flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--rs-gold-tint)', color: 'var(--rs-gold-text)' }}><Icon name="award" size={18} /></span>
                    <div className="min-w-0">
                      <div className="text-ink text-sm font-semibold truncate">{c.course.title}</div>
                      <div className="text-dim text-xs">{c.course.level} · Issued {formatDate(c.issuedAt)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted text-sm">Complete every lesson in a course to earn its certificate. <Link href="/classroom" className="link">Go to classroom</Link></p>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-5">
          <section className="card-flat overflow-hidden">
            {LINKS.map((l, i) => (
              <Link key={l.href} href={l.href} className={`flex items-center gap-3 px-4 py-3.5 no-underline transition-colors hover:bg-[var(--rs-surface-2)] ${i ? 'border-t hairline' : ''}`}>
                <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--rs-surface-2)', color: 'var(--rs-muted)' }}><Icon name={l.icon} size={17} /></span>
                <span className="min-w-0 flex-1"><span className="block text-ink text-sm font-semibold">{l.label}</span><span className="block text-dim text-xs">{l.sub}</span></span>
                <Icon name="chevronRight" size={16} className="text-faint" />
              </Link>
            ))}
          </section>
          <ProfileActions />
        </div>
      </div>
    </div>
  )
}
