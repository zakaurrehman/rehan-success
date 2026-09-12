import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { Icon, type IconName } from '@/components/brand/icons'
import { BRAND, SOCIALS, STORES, SUPPORT_EMAIL } from '@/lib/site'

const ALL_SOCIALS: { label: string; href: string; icon: IconName }[] = [
  { label: 'WhatsApp', href: SOCIALS.whatsapp, icon: 'whatsapp' },
  { label: 'Telegram', href: SOCIALS.telegram, icon: 'telegram' },
  { label: 'Instagram', href: SOCIALS.instagram, icon: 'instagram' },
  { label: 'YouTube', href: SOCIALS.youtube, icon: 'youtube' },
]
const SOCIAL_LINKS = ALL_SOCIALS.filter((s) => s.href)

const PLATFORM: [string, string][] = [
  ['Live Signals', '/signals'], ['Market Research', '/research'], ['Classroom', '/classroom'],
  ['Community', '/community'], ['Risk Calculator', '/calculator'],
]
const COMPANY: [string, string][] = [
  ['Pricing', '/pricing'], ['Reviews', '/reviews'], ['Affiliate program', '/register'], ['Sign in', '/login'],
]

export function StoreBadges({ size = 'md' }: { size?: 'sm' | 'md' }) {
  if (!STORES.ios && !STORES.android) return null
  const h = size === 'sm' ? 'h-11' : 'h-[52px]'
  return (
    <div className="flex flex-wrap gap-2.5">
      {STORES.ios ? (
        <a href={STORES.ios} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2.5 px-4 ${h} rounded-xl bg-black text-white border border-white/10 hover:border-white/30 transition-colors`}>
          <Icon name="apple" size={22} />
          <span className="text-left leading-tight"><span className="block text-[10px] opacity-75">Download on the</span><span className="block text-[15px] font-semibold">App Store</span></span>
        </a>
      ) : null}
      {STORES.android ? (
        <a href={STORES.android} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2.5 px-4 ${h} rounded-xl bg-black text-white border border-white/10 hover:border-white/30 transition-colors`}>
          <Icon name="googlePlay" size={20} />
          <span className="text-left leading-tight"><span className="block text-[10px] opacity-75">Get it on</span><span className="block text-[15px] font-semibold">Google Play</span></span>
        </a>
      ) : null}
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="border-t hairline" style={{ background: 'var(--rs-canvas-2)' }}>
      <div className="container-x py-14">
        <div className="grid gap-10 grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1.3fr]">
          <div className="col-span-2 md:col-span-1">
            <Logo size={34} />
            <p className="text-muted text-sm leading-relaxed mt-4 mb-5 max-w-xs">{BRAND.tagline} Professional Forex education, live signals and a community of focused traders.</p>
            <StoreBadges size="sm" />
            {SOCIAL_LINKS.length ? (
              <div className="flex gap-2 mt-5">
                {SOCIAL_LINKS.map((s) => (
                  <a key={s.label} href={s.href} aria-label={s.label} title={s.label} target="_blank" rel="noopener noreferrer"
                     className="w-9 h-9 rounded-lg flex items-center justify-center border hairline text-muted hover:text-primary transition-colors" style={{ background: 'var(--rs-surface)' }}>
                    <Icon name={s.icon} size={17} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <FooterCol title="Platform" links={PLATFORM} />
          <FooterCol title="Company" links={COMPANY} />

          <div className="col-span-2 md:col-span-1">
            <div className="text-ink font-semibold text-sm mb-4">Support</div>
            <p className="text-muted text-sm leading-relaxed">
              Questions about plans, payments or your account? Email us at{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="link break-words">{SUPPORT_EMAIL}</a>
            </p>
          </div>
        </div>

        <p className="text-faint text-[11px] leading-relaxed mt-12 max-w-4xl">
          <strong className="text-dim">Risk disclaimer:</strong> Trading Forex and leveraged products carries a high risk of loss and is not suitable for all investors. Past signal performance does not guarantee future results. {BRAND.name} provides educational content and trade ideas for information only and is not a licensed financial adviser.
        </p>

        <div className="mt-6 pt-6 border-t hairline flex flex-wrap items-center justify-between gap-3">
          <div className="text-dim text-xs">© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</div>
          <div className="flex gap-5">
            <Link href="/privacy" className="link-muted text-xs">Privacy policy</Link>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="link-muted text-xs">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="text-ink font-semibold text-sm mb-4">{title}</div>
      <ul className="space-y-2.5">
        {links.map(([l, h]) => (
          <li key={l}><Link href={h} className="link-muted text-sm">{l}</Link></li>
        ))}
      </ul>
    </div>
  )
}
