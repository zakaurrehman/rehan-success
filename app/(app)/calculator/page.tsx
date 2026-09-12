'use client'
import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/ui/states'
import { Icon } from '@/components/brand/icons'

// Pip multiplier per pair — unchanged from the original calculator.
const PAIRS: Record<string, number> = {
  'EUR/USD': 1, 'GBP/USD': 1, 'AUD/USD': 1, 'NZD/USD': 1,
  'USD/JPY': 100, 'USD/CHF': 1, 'USD/CAD': 1,
  'GBP/JPY': 100, 'EUR/JPY': 100, 'XAU/USD': 1,
}

const RULES: [string, string][] = [
  ['1–2% rule', 'Never risk more than 2% of your account on a single trade.'],
  ['Risk:reward', 'Aim for at least 1:2 — risk $1 to make $2.'],
  ['Correlation', 'Avoid stacking multiple correlated positions at once.'],
  ['Stop loss', 'Always use a stop loss. No exceptions — markets move fast.'],
]

const RISK_PRESETS = ['0.5', '1', '2']

export default function CalculatorPage() {
  const [form, setForm] = useState({ account: '10000', risk: '1', pair: 'EUR/USD', sl: '20' })

  function set(f: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((prev) => ({ ...prev, [f]: e.target.value }))
  }

  // Same formula as before, computed live as inputs change.
  const result = useMemo(() => {
    const account = parseFloat(form.account)
    const risk = parseFloat(form.risk) / 100
    const sl = parseFloat(form.sl)
    const pipMult = PAIRS[form.pair] || 1
    if (!account || !risk || !sl) return null
    const riskAmount = account * risk
    const pipValue = 10 / pipMult
    const lotSize = riskAmount / (sl * pipValue)
    return { lotSize: Math.round(lotSize * 100) / 100, riskAmount: Math.round(riskAmount * 100) / 100, pipValue: Math.round(pipValue * 100) / 100 }
  }, [form])

  const riskNum = parseFloat(form.risk)
  const riskTone = !riskNum ? 'neutral' : riskNum <= 1 ? 'success' : riskNum <= 2 ? 'warning' : 'danger'

  return (
    <div className="fade-in">
      <PageHeader title="Risk calculator" subtitle="Size every position from your balance, risk and stop distance." />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <form className="card flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="field-label" htmlFor="account">Account balance</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim text-sm">$</span>
              <input id="account" className="field num pl-7" type="number" inputMode="decimal" min="0" value={form.account} onChange={set('account')} placeholder="10000" />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="risk">Risk per trade</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input id="risk" className="field num pr-8" type="number" inputMode="decimal" step="0.1" min="0" value={form.risk} onChange={set('risk')} placeholder="1" />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dim text-sm">%</span>
              </div>
              {RISK_PRESETS.map((r) => (
                <button key={r} type="button" onClick={() => setForm((f) => ({ ...f, risk: r }))} className={`chip !rounded-xl !px-3 ${form.risk === r ? 'chip-active' : ''}`}>{r}%</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="pair">Instrument</label>
              <select id="pair" className="field" value={form.pair} onChange={set('pair')}>
                {Object.keys(PAIRS).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="sl">Stop loss (pips)</label>
              <input id="sl" className="field num" type="number" inputMode="decimal" min="0" value={form.sl} onChange={set('sl')} placeholder="20" />
            </div>
          </div>
          {riskTone === 'danger' ? (
            <div className="alert alert-danger"><Icon name="alert" size={16} /><span>Risking more than 2% per trade can wipe out an account quickly.</span></div>
          ) : null}
        </form>

        <section className="card flex flex-col" aria-live="polite">
          <div className="section-title">Position size</div>
          {result ? (
            <>
              <div className="mt-3 flex items-end gap-2">
                <span className="num text-5xl font-semibold text-primary tracking-tight">{result.lotSize}</span>
                <span className="text-muted mb-1.5">standard lots</span>
              </div>
              <dl className="grid grid-cols-2 gap-3 mt-5">
                <div className="card-sub">
                  <dt className="text-dim text-xs">Amount at risk</dt>
                  <dd className="num text-lg font-semibold mt-0.5" style={{ color: 'var(--rs-danger-text)' }}>${result.riskAmount.toLocaleString()}</dd>
                  <dd className={`pill mt-1.5 ${riskTone === 'success' ? 'pill-success' : riskTone === 'warning' ? 'pill-warning' : 'pill-danger'}`}>{form.risk}% of balance</dd>
                </div>
                <div className="card-sub">
                  <dt className="text-dim text-xs">Pip value</dt>
                  <dd className="num text-ink text-lg font-semibold mt-0.5">${result.pipValue}</dd>
                  <dd className="text-dim text-xs mt-1.5">per pip, per lot</dd>
                </div>
              </dl>
              <p className="text-muted text-sm leading-relaxed mt-5 pt-4 border-t hairline">
                With <strong>{form.pair}</strong>, a <strong className="num">{form.sl}</strong> pip stop and a <strong className="num">${Number(form.account).toLocaleString()}</strong> balance, trade <strong className="num text-primary">{result.lotSize}</strong> lots to risk {form.risk}%.
              </p>
            </>
          ) : (
            <p className="text-muted text-sm mt-4">Enter your balance, risk and stop loss to see the recommended position size.</p>
          )}
        </section>
      </div>

      <section className="card mt-5">
        <h2 className="text-base font-bold mb-4">Risk management rules</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {RULES.map(([title, desc]) => (
            <li key={title} className="flex gap-3">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--rs-primary-tint)', color: 'var(--rs-primary)' }}><Icon name="shieldCheck" size={16} /></span>
              <div><div className="text-ink text-sm font-semibold">{title}</div><div className="text-muted text-sm">{desc}</div></div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
