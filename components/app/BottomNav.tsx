'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@/components/brand/icons'
import { BOTTOM_NAV, isActive } from './nav'

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="app-bottom fixed bottom-0 inset-x-0 z-50 glass border-t hairline safe-bottom" aria-label="Primary">
      <ul className="grid grid-cols-5 h-[64px]">
        {BOTTOM_NAV.map((item) => {
          const active = isActive(pathname, item.href)
          if (item.live) {
            return (
              <li key={item.href} className="flex items-start justify-center">
                <Link href={item.href} className="flex flex-col items-center -mt-4 no-underline" aria-current={active ? 'page' : undefined} aria-label="Live signals">
                  <span
                    className="w-14 h-14 rounded-2xl flex items-center justify-center live-ring"
                    style={{ background: 'var(--rs-primary)', color: 'var(--rs-primary-fg)', boxShadow: 'var(--rs-shadow-primary)', border: '3px solid var(--rs-canvas)' }}
                  >
                    <Icon name="bolt" size={24} strokeWidth={2} />
                  </span>
                  <span className="text-[10px] font-bold mt-0.5 tracking-wide" style={{ color: active ? 'var(--rs-primary)' : 'var(--rs-muted)' }}>
                    {item.label}
                  </span>
                </Link>
              </li>
            )
          }
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="h-full flex flex-col items-center justify-center gap-1 no-underline"
                aria-current={active ? 'page' : undefined}
                style={{ color: active ? 'var(--rs-primary)' : 'var(--rs-dim)' }}
              >
                <Icon name={item.icon} size={21} strokeWidth={active ? 2.1 : 1.75} />
                <span className="text-[10.5px]" style={{ fontWeight: active ? 700 : 500 }}>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
