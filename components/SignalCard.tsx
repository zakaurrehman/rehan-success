import { formatDateTime, formatPrice } from '@/lib/utils'
import { Icon } from '@/components/brand/icons'

export type SignalView = {
  id: string
  pair: string
  direction: 'BUY' | 'SELL'
  entry: number
  tp1: number
  tp2?: number | null
  tp3?: number | null
  sl: number
  status: 'ACTIVE' | 'HIT_TP' | 'HIT_SL' | 'CLOSED'
  pips?: number | null
  notes?: string | null
  createdAt: Date | string
}

const STATUS: Record<SignalView['status'], { label: string; cls: string }> = {
  ACTIVE: { label: 'Active', cls: 'pill-success' },
  HIT_TP: { label: 'TP hit', cls: 'pill-primary' },
  HIT_SL: { label: 'SL hit', cls: 'pill-danger' },
  CLOSED: { label: 'Closed', cls: 'pill-neutral' },
}

/** Display-only distance between entry and a level, in raw price units. */
function distance(a: number, b: number, pair: string) {
  return formatPrice(Math.abs(a - b), pair)
}

export default function SignalCard({ signal, compact = false }: { signal: SignalView; compact?: boolean }) {
  const isBuy = signal.direction === 'BUY'
  const s = STATUS[signal.status]
  const dirColor = isBuy ? 'var(--rs-success)' : 'var(--rs-danger)'

  return (
    <article className="card-flat overflow-hidden" style={{ boxShadow: 'var(--rs-shadow-xs)' }}>
      <div className="flex">
        <span className="w-1 shrink-0" style={{ background: dirColor }} aria-hidden="true" />
        <div className="flex-1 min-w-0 p-4">
          {/* header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: isBuy ? 'var(--rs-success-tint)' : 'var(--rs-danger-tint)', color: isBuy ? 'var(--rs-success-text)' : 'var(--rs-danger-text)' }}
              >
                <Icon name={isBuy ? 'trendingUp' : 'trendingDown'} size={18} />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-ink font-bold text-base tracking-tight">{signal.pair}</h3>
                  <span className={`pill ${isBuy ? 'pill-solid-success' : 'pill-solid-danger'}`}>{signal.direction}</span>
                </div>
                <div className="text-dim text-xs mt-0.5">{formatDateTime(signal.createdAt)}</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={`pill ${s.cls}`}>
                {signal.status === 'ACTIVE' ? <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: 'currentColor' }} /> : null}
                {s.label}
              </span>
              {signal.pips != null ? (
                <span className="num text-sm font-semibold" style={{ color: signal.pips >= 0 ? 'var(--rs-success-text)' : 'var(--rs-danger-text)' }}>
                  {signal.pips >= 0 ? '+' : ''}{signal.pips} pips
                </span>
              ) : null}
            </div>
          </div>

          {/* levels */}
          <div className={`grid gap-2 mt-3.5 ${compact ? 'grid-cols-3' : 'grid-cols-2 min-[440px]:grid-cols-3 md:grid-cols-5'}`}>
            <div className="level">
              <div className="level-label">Entry</div>
              <div className="level-value">{formatPrice(signal.entry, signal.pair)}</div>
            </div>
            <div className="level" style={{ borderColor: 'var(--rs-success-line)' }}>
              <div className="level-label" style={{ color: 'var(--rs-success-text)' }}>TP1</div>
              <div className="level-value">{formatPrice(signal.tp1, signal.pair)}</div>
            </div>
            {!compact && signal.tp2 ? (
              <div className="level" style={{ borderColor: 'var(--rs-success-line)' }}>
                <div className="level-label" style={{ color: 'var(--rs-success-text)' }}>TP2</div>
                <div className="level-value">{formatPrice(signal.tp2, signal.pair)}</div>
              </div>
            ) : null}
            {!compact && signal.tp3 ? (
              <div className="level" style={{ borderColor: 'var(--rs-success-line)' }}>
                <div className="level-label" style={{ color: 'var(--rs-success-text)' }}>TP3</div>
                <div className="level-value">{formatPrice(signal.tp3, signal.pair)}</div>
              </div>
            ) : null}
            <div className="level" style={{ borderColor: 'var(--rs-danger-line)' }}>
              <div className="level-label" style={{ color: 'var(--rs-danger-text)' }}>Stop loss</div>
              <div className="level-value">{formatPrice(signal.sl, signal.pair)}</div>
            </div>
          </div>

          {!compact ? (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-xs text-dim">
              <span>Risk to SL <span className="num text-muted">{distance(signal.entry, signal.sl, signal.pair)}</span></span>
              <span>Reward to TP1 <span className="num text-muted">{distance(signal.tp1, signal.entry, signal.pair)}</span></span>
            </div>
          ) : null}

          {signal.notes && !compact ? (
            <p className="text-muted text-[13px] leading-relaxed mt-3 pt-3 border-t hairline">{signal.notes}</p>
          ) : null}
        </div>
      </div>
    </article>
  )
}
