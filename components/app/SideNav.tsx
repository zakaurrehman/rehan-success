'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Logo } from '@/components/brand/Logo'
import { Icon } from '@/components/brand/icons'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { APP_NAV, isActive } from './nav'

export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-5" aria-label="Main">
      {APP_NAV.map((group) => (
        <div key={group.title}>
          <div className="section-title px-3 mb-1.5">{group.title}</div>
          <ul className="flex flex-col gap-0.5">
            {group.links.map((l) => {
              const active = isActive(pathname, l.href)
              return (
                <li key={l.href}>
                  <Link href={l.href} onClick={onNavigate} className="nav-item" aria-current={active ? 'page' : undefined}>
                    <Icon name={l.icon} size={18} />
                    <span className="flex-1">{l.label}</span>
                    {l.live ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider" style={{ color: 'var(--rs-danger-text)' }}>
                        <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: 'var(--rs-danger)' }} />
                        LIVE
                      </span>
                    ) : null}
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

export default function SideNav({ name, plan }: { name: string; plan: string }) {
  return (
    <aside className="app-side">
      <div className="px-5 pt-5 pb-4">
        <Logo size={32} href="/dashboard" />
      </div>
      <div className="flex-1 px-3 py-2 overflow-y-auto">
        <NavList />
      </div>
      <div className="p-3 border-t hairline">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <span className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: 'var(--rs-primary-tint-2)', color: 'var(--rs-primary)' }}>
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-ink text-sm font-semibold truncate">{name}</div>
            <div className="text-dim text-xs">{plan} plan</div>
          </div>
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="nav-item w-full mt-1"
        >
          <Icon name="logout" size={18} /> Sign out
        </button>
      </div>
    </aside>
  )
}
