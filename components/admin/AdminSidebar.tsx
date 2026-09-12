'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Logo } from '@/components/brand/Logo'
import { Icon, type IconName } from '@/components/brand/icons'
import ThemeToggle from '@/components/ui/ThemeToggle'

export type AdminCounts = { payments: number; withdrawals: number; reviews: number; affiliates: number }

type L = { href: string; label: string; icon: IconName; badge?: keyof AdminCounts }
const GROUPS: { title: string; links: L[] }[] = [
  { title: 'Overview', links: [{ href: '/admin', label: 'Dashboard', icon: 'grid' }] },
  {
    title: 'Content',
    links: [
      { href: '/admin/signals', label: 'Signals', icon: 'bolt' },
      { href: '/admin/research', label: 'Research posts', icon: 'fileText' },
      { href: '/admin/videos', label: 'Classroom', icon: 'play' },
      { href: '/admin/sessions', label: 'Live sessions', icon: 'radio' },
      { href: '/admin/calendar', label: 'Economic calendar', icon: 'calendar' },
      { href: '/admin/brokers', label: 'Brokers', icon: 'building' },
      { href: '/admin/resources', label: 'Resources', icon: 'layers' },
      { href: '/admin/reviews', label: 'Reviews', icon: 'star', badge: 'reviews' },
    ],
  },
  {
    title: 'Members & money',
    links: [
      { href: '/admin/users', label: 'Users', icon: 'users' },
      { href: '/admin/affiliates', label: 'Affiliates', icon: 'gift', badge: 'affiliates' },
      { href: '/admin/payments', label: 'Payments', icon: 'card', badge: 'payments' },
      { href: '/admin/sales', label: 'Log a sale', icon: 'trendingUp' },
      { href: '/admin/withdrawals', label: 'Withdrawals', icon: 'wallet', badge: 'withdrawals' },
    ],
  },
]

function Nav({ counts, onNavigate }: { counts: AdminCounts; onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-5" aria-label="Admin">
      {GROUPS.map((g) => (
        <div key={g.title}>
          <div className="section-title px-3 mb-1.5">{g.title}</div>
          <ul className="flex flex-col gap-0.5">
            {g.links.map((l) => {
              const active = l.href === '/admin' ? pathname === '/admin' : pathname.startsWith(l.href)
              const n = l.badge ? counts[l.badge] : 0
              return (
                <li key={l.href}>
                  <Link href={l.href} onClick={onNavigate} className="nav-item" aria-current={active ? 'page' : undefined}>
                    <Icon name={l.icon} size={18} />
                    <span className="flex-1">{l.label}</span>
                    {n > 0 ? <span className="num text-[11px] font-bold min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center" style={{ background: 'var(--rs-warning)', color: '#1a1405' }}>{n}</span> : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function Footer() {
  return (
    <div className="p-3 border-t hairline flex items-center gap-2">
      <button type="button" onClick={() => signOut({ callbackUrl: '/login' })} className="nav-item flex-1">
        <Icon name="logout" size={18} /> Sign out
      </button>
      <ThemeToggle />
    </div>
  )
}

export default function AdminSidebar({ counts }: { counts: AdminCounts }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  useEffect(() => { setOpen(false) }, [pathname])
  const pending = counts.payments + counts.withdrawals + counts.reviews + counts.affiliates

  return (
    <>
      <aside className="admin-side">
        <div className="px-5 pt-5 pb-4">
          <Logo size={30} href="/admin" />
          <span className="pill pill-neutral mt-3">Admin console</span>
        </div>
        <div className="flex-1 px-3 py-2 overflow-y-auto"><Nav counts={counts} /></div>
        <Footer />
      </aside>

      <header className="admin-topbar lg:hidden sticky top-0 z-40 glass border-b hairline">
        <div className="flex items-center justify-between h-14 px-3">
          <Logo size={28} href="/admin" />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button type="button" onClick={() => setOpen(true)} className="btn btn-ghost btn-sm btn-icon relative" aria-label="Open admin menu">
              <Icon name="menu" size={20} />
              {pending > 0 ? <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--rs-warning)' }} /> : null}
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[90] lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <div className="absolute inset-0" style={{ background: 'var(--rs-overlay)' }} onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[84%] max-w-[300px] flex flex-col" style={{ background: 'var(--rs-surface)', boxShadow: 'var(--rs-shadow-lg)', animation: 'popIn .2s both' }}>
            <div className="flex items-center justify-between px-4 h-14 border-b hairline">
              <Logo size={26} href="/admin" />
              <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost btn-sm btn-icon" aria-label="Close menu"><Icon name="close" size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 pl-4"><Nav counts={counts} onNavigate={() => setOpen(false)} /></div>
            <Footer />
          </div>
        </div>
      ) : null}
    </>
  )
}
