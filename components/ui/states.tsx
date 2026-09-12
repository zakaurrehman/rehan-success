import type { ReactNode } from 'react'
import Link from 'next/link'
import { Icon, type IconName } from '@/components/brand/icons'

/* ── Page header ─────────────────────────────────────────────────────────── */
export function PageHeader({
  title,
  subtitle,
  actions,
  back,
  eyebrow,
}: {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  back?: { href: string; label: string }
  eyebrow?: ReactNode
}) {
  return (
    <div className="mb-6">
      {back ? (
        <Link href={back.href} className="link-muted inline-flex items-center gap-1 text-[13px] font-medium mb-3">
          <Icon name="chevronLeft" size={16} /> {back.label}
        </Link>
      ) : null}
      <div className="page-head !mb-0">
        <div className="min-w-0">
          {eyebrow ? <div className="mb-1.5">{eyebrow}</div> : null}
          <h1 className="page-title">{title}</h1>
          {subtitle ? <p className="page-sub">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2 flex-wrap">{actions}</div> : null}
      </div>
    </div>
  )
}

/* ── Empty state ─────────────────────────────────────────────────────────── */
export function EmptyState({
  icon = 'layers',
  title,
  description,
  action,
  compact = false,
}: {
  icon?: IconName
  title: string
  description?: ReactNode
  action?: ReactNode
  compact?: boolean
}) {
  return (
    <div className={`card-flat text-center ${compact ? 'px-5 py-8' : 'px-6 py-14'}`} style={{ borderStyle: 'dashed' }}>
      <span className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--rs-surface-2)', color: 'var(--rs-dim)' }}>
        <Icon name={icon} size={22} />
      </span>
      <p className="text-ink font-semibold mt-4">{title}</p>
      {description ? <p className="text-muted text-sm mt-1 max-w-sm mx-auto leading-relaxed">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}

/* ── Error state ─────────────────────────────────────────────────────────── */
export function ErrorState({ title = 'Something went wrong', description, action }: { title?: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="card-flat text-center px-6 py-12">
      <span className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--rs-danger-tint)', color: 'var(--rs-danger-text)' }}>
        <Icon name="alert" size={22} />
      </span>
      <p className="text-ink font-semibold mt-4">{title}</p>
      {description ? <p className="text-muted text-sm mt-1 max-w-sm mx-auto">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}

/* ── Skeleton list ───────────────────────────────────────────────────────── */
export function SkeletonList({ rows = 3, height = 96 }: { rows?: number; height?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton rounded-2xl" style={{ height }} />
      ))}
    </div>
  )
}

/* ── Stat tile ───────────────────────────────────────────────────────────── */
export function StatTile({
  label,
  value,
  hint,
  icon,
  tone = 'neutral',
  href,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon?: IconName
  tone?: 'neutral' | 'primary' | 'success' | 'danger' | 'warning' | 'gold'
  href?: string
}) {
  const toneColor: Record<string, string> = {
    neutral: 'var(--rs-muted)', primary: 'var(--rs-primary)', success: 'var(--rs-success-text)',
    danger: 'var(--rs-danger-text)', warning: 'var(--rs-warning-text)', gold: 'var(--rs-gold-text)',
  }
  const toneBg: Record<string, string> = {
    neutral: 'var(--rs-surface-2)', primary: 'var(--rs-primary-tint)', success: 'var(--rs-success-tint)',
    danger: 'var(--rs-danger-tint)', warning: 'var(--rs-warning-tint)', gold: 'var(--rs-gold-tint)',
  }
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="stat-label">{label}</span>
        {icon ? (
          <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: toneBg[tone], color: toneColor[tone] }}>
            <Icon name={icon} size={15} />
          </span>
        ) : null}
      </div>
      <div className="stat-value num" style={tone !== 'neutral' ? { color: toneColor[tone] } : undefined}>{value}</div>
      {hint ? <div className="text-dim text-xs mt-1">{hint}</div> : null}
    </>
  )
  if (href) return <Link href={href} className="stat card-hover block no-underline">{body}</Link>
  return <div className="stat">{body}</div>
}

/* ── Status pill ─────────────────────────────────────────────────────────── */
const STATUS_TONE: Record<string, string> = {
  ACTIVE: 'pill-success', APPROVED: 'pill-success', PAID: 'pill-success', CONFIRMED: 'pill-success', PUBLISHED: 'pill-success',
  PENDING: 'pill-warning', SCHEDULED: 'pill-primary',
  REJECTED: 'pill-danger', HIT_SL: 'pill-danger', LIVE: 'pill-danger',
  HIT_TP: 'pill-primary', CLOSED: 'pill-neutral', HIDDEN: 'pill-neutral',
}
const STATUS_LABEL: Record<string, string> = { HIT_TP: 'TP hit', HIT_SL: 'SL hit' }

export function StatusPill({ status, label }: { status: string; label?: string }) {
  const text = label ?? STATUS_LABEL[status] ?? status.charAt(0) + status.slice(1).toLowerCase()
  return <span className={`pill ${STATUS_TONE[status] || 'pill-neutral'}`}>{text}</span>
}

/* ── Section heading inside a page ───────────────────────────────────────── */
export function SectionHeading({ title, action }: { title: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <h2 className="section-title">{title}</h2>
      {action}
    </div>
  )
}

/* ── Avatar initials ─────────────────────────────────────────────────────── */
export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?'
  return (
    <span
      className="rounded-full flex items-center justify-center font-bold shrink-0"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38), background: 'var(--rs-primary-tint-2)', color: 'var(--rs-primary)' }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}
