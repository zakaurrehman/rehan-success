'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { Icon } from '@/components/brand/icons'
import ThemeToggle from '@/components/ui/ThemeToggle'

const SECTIONS: [string, string][] = [
  ['Performance', 'signals'],
  ['Features', 'features'],
  ['Mentor', 'about'],
  ['Pricing', 'pricing'],
  ['Reviews', 'reviews'],
  ['FAQ', 'faq'],
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.history.pushState(null, '', `/${id}`)
    }
    setOpen(false)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Deep links (/pricing, /faq … are rewritten to "/") scroll to their section.
  useEffect(() => {
    const path = window.location.pathname.replace(/^\//, '')
    if (SECTIONS.some(([, id]) => id === path)) setTimeout(() => scrollTo(path), 120)
  }, [scrollTo])

  useEffect(() => {
    const els = SECTIONS.map(([, id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 border-b ${scrolled || open ? 'glass hairline' : 'border-transparent'}`}>
      <nav className="container-x flex items-center justify-between h-16 md:h-[72px]" aria-label="Main">
        <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setOpen(false) }} aria-label="Rehan Success — back to top" className="shrink-0">
          <Logo size={34} href={null} />
        </button>

        <div className="hidden lg:flex items-center gap-0.5">
          {SECTIONS.map(([label, id]) => (
            <a
              key={id}
              href={`/${id}`}
              onClick={(e) => { e.preventDefault(); scrollTo(id) }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active === id ? 'text-primary' : 'text-muted hover:text-ink'}`}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-1.5">
          <ThemeToggle />
          <Link href="/login" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link href="/order" className="btn btn-primary btn-sm">Get started</Link>
        </div>

        <div className="flex lg:hidden items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setOpen((o) => !o)}
            className="btn btn-ghost btn-sm btn-icon"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </nav>

      <div
        className={`lg:hidden fixed inset-x-0 top-16 bottom-0 z-40 transition-opacity duration-200 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'var(--rs-canvas)' }}
      >
        <div className="container-x py-4 flex flex-col">
          {SECTIONS.map(([label, id], i) => (
            <a
              key={id}
              href={`/${id}`}
              onClick={(e) => { e.preventDefault(); scrollTo(id) }}
              className="flex items-center justify-between py-4 border-b hairline text-lg font-display font-semibold text-ink"
              style={{ animation: open ? `fadeUp .35s ${i * 35}ms both` : 'none' }}
            >
              {label}
              <Icon name="chevronRight" size={18} className="text-dim" />
            </a>
          ))}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Link href="/login" className="btn btn-secondary btn-lg" onClick={() => setOpen(false)}>Sign in</Link>
            <Link href="/order" className="btn btn-primary btn-lg" onClick={() => setOpen(false)}>Get started</Link>
          </div>
          <Link href="/register" className="btn btn-ghost mt-3" onClick={() => setOpen(false)}>Become an affiliate</Link>
        </div>
      </div>
    </header>
  )
}
