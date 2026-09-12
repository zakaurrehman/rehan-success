'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Logo } from '@/components/brand/Logo'
import { Icon } from '@/components/brand/icons'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { NavList } from './SideNav'

/** Mobile/tablet header with a slide-in drawer holding the full navigation. */
export default function TopBar({ name, plan, unread }: { name: string; plan: string; unread: number }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <header className="app-top glass border-b hairline">
        <div className="flex items-center justify-between h-14 px-3">
          <Logo size={28} href="/dashboard" />
          <div className="flex items-center gap-0.5">
            <ThemeToggle />
            <Link href="/notifications" className="btn btn-ghost btn-sm btn-icon relative" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
              <Icon name="bell" size={19} />
              {unread > 0 ? (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: 'var(--rs-danger)', color: '#fff' }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              ) : null}
            </Link>
            <button type="button" onClick={() => setOpen(true)} className="btn btn-ghost btn-sm btn-icon" aria-label="Open menu" aria-expanded={open}>
              <Icon name="menu" size={20} />
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[90] md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0" style={{ background: 'var(--rs-overlay)', animation: 'fadeIn .2s both' }} onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[86%] max-w-[320px] flex flex-col" style={{ background: 'var(--rs-surface)', boxShadow: 'var(--rs-shadow-lg)', animation: 'popIn .22s both' }}>
            <div className="flex items-center justify-between px-4 h-14 border-b hairline">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: 'var(--rs-primary-tint-2)', color: 'var(--rs-primary)' }}>
                  {name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="text-ink text-sm font-semibold truncate">{name}</div>
                  <div className="text-dim text-xs">{plan} plan</div>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost btn-sm btn-icon" aria-label="Close menu">
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4 pl-4">
              <NavList onNavigate={() => setOpen(false)} />
            </div>
            <div className="p-3 border-t hairline safe-bottom">
              <button type="button" onClick={() => signOut({ callbackUrl: '/login' })} className="btn btn-danger-soft btn-block">
                <Icon name="logout" size={17} /> Sign out
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
