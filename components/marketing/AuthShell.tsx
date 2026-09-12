import type { ReactNode } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { Icon } from '@/components/brand/icons'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { BRAND } from '@/lib/site'

/**
 * Split-screen shell for sign-in / registration: a brand panel on large
 * screens, a focused single column on phones.
 */
export default function AuthShell({ children, title, subtitle, wide = false }: { children: ReactNode; title: string; subtitle?: ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-dvh grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* Brand panel */}
      <aside className="hidden lg:flex relative overflow-hidden flex-col justify-between p-12 text-white" style={{ background: 'linear-gradient(160deg, #0b3f3b 0%, #0b1020 70%)' }}>
        <div aria-hidden className="absolute inset-0 opacity-[0.07] bg-grid" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)' }} />
        <div aria-hidden className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.28), transparent 65%)' }} />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Logo size={36} href={null} onDark />
          </Link>
        </div>
        <div className="relative max-w-md">
          <h2 className="text-white text-4xl font-extrabold leading-[1.1]">{BRAND.tagline}</h2>
          <p className="mt-4 text-white/70 leading-relaxed">Live BUY/SELL signals with precise levels, structured ICT education and a disciplined community — in one workspace.</p>
          <ul className="mt-8 space-y-3">
            {['Signals with Entry, TP and SL on every trade', 'Courses from fundamentals to Smart Money Concepts', 'Transparent monthly performance history'].map((t) => (
              <li key={t} className="flex items-center gap-3 text-white/85 text-sm">
                <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.18)', color: '#5eead4' }}>
                  <Icon name="check" size={14} strokeWidth={2.4} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-white/45 text-xs">Trading involves risk. Educational content only — not financial advice.</p>
      </aside>

      {/* Form column */}
      <main className="relative flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="link-muted inline-flex items-center gap-1 text-[13px] font-medium">
            <Icon name="chevronLeft" size={16} /> Home
          </Link>
          <ThemeToggle />
        </div>
        <div className={`w-full mx-auto my-auto py-8 ${wide ? 'max-w-[560px]' : 'max-w-[400px]'}`}>
          <div className="lg:hidden mb-8"><Logo size={36} href={null} /></div>
          <h1 className="text-[1.75rem] font-extrabold">{title}</h1>
          {subtitle ? <p className="text-muted mt-2 text-[15px]">{subtitle}</p> : null}
          <div className="mt-7">{children}</div>
        </div>
      </main>
    </div>
  )
}
