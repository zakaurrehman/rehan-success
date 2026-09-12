import Link from 'next/link'
import { useId } from 'react'

/* ── The mark ──────────────────────────────────────────────────────────────
   A deep-teal rounded tile holding three ascending bars whose tallest bar is
   capped with a champagne-gold point — "steady, compounding success".
   Built from solid shapes so it stays crisp at favicon size.            */

export function LogoMark({ size = 36, className = '' }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`rsTile${id}`} x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14B8A6" />
          <stop offset="0.55" stopColor="#0F766E" />
          <stop offset="1" stopColor="#0B3F3B" />
        </linearGradient>
        <linearGradient id={`rsGold${id}`} x1="30" y1="8" x2="40" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F1D786" />
          <stop offset="1" stopColor="#C9A13A" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="13" fill={`url(#rsTile${id})`} />
      <rect x="1.5" y="1.5" width="45" height="45" rx="12.5" stroke="#ffffff" strokeOpacity="0.14" />
      {/* ascending bars */}
      <rect x="10.5" y="27" width="6.5" height="11" rx="2.2" fill="#ffffff" fillOpacity="0.62" />
      <rect x="20.75" y="20.5" width="6.5" height="17.5" rx="2.2" fill="#ffffff" fillOpacity="0.82" />
      <rect x="31" y="15" width="6.5" height="23" rx="2.2" fill="#ffffff" />
      {/* gold apex */}
      <path d="M34.25 6.5 L39.6 12.4 L28.9 12.4 Z" fill={`url(#rsGold${id})`} />
    </svg>
  )
}

/* ── Wordmark lockup ────────────────────────────────────────────────────── */
export function Logo({
  size = 34,
  href = '/',
  showWord = true,
  onDark = false,
  className = '',
}: {
  size?: number
  href?: string | null
  showWord?: boolean
  /** Force light wordmark colours (for dark brand panels regardless of theme). */
  onDark?: boolean
  className?: string
}) {
  const inner = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {showWord && (
        <span className="font-display leading-none tracking-tight" style={{ fontSize: Math.round(size * 0.5), color: onDark ? '#ffffff' : 'var(--rs-ink)' }}>
          <span className="font-extrabold">Rehan</span>
          <span className="font-semibold" style={{ color: onDark ? '#5eead4' : 'var(--rs-primary)' }}> Success</span>
        </span>
      )}
    </span>
  )
  if (href === null) return inner
  return (
    <Link href={href} aria-label="Rehan Success — home" className="inline-flex items-center">
      {inner}
    </Link>
  )
}

export default Logo
