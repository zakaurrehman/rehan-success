'use client'
import { useState } from 'react'
import Link from 'next/link'
import { SERVICES } from '@/lib/utils'
import { PAYMENT_METHODS } from '@/lib/constants'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/brand/icons'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from '@/lib/site'

type Service = (typeof SERVICES)[number]

export default function OrderPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [selected, setSelected] = useState<Service | null>(null)
  const [form, setForm] = useState({ clientName: '', clientEmail: '', phone: '', country: '', referralCode: '', paymentMethod: '', paymentNote: '' })
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(f: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((prev) => ({ ...prev, [f]: e.target.value }))
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selected) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, service: selected.name, amount: selected.price }) })
      if (!res.ok) throw new Error()
      setSuccess(true)
    } catch {
      setError('We couldn’t submit your order. Please check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b hairline" style={{ background: 'var(--rs-surface)' }}>
        <div className="container-x h-16 flex items-center justify-between">
          <Logo size={30} />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link href="/login" className="btn btn-ghost btn-sm">Sign in</Link>
          </div>
        </div>
      </header>

      {success ? (
        <div className="container-tight py-20">
          <div className="card max-w-md mx-auto text-center py-10">
            <span className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--rs-success-tint)', color: 'var(--rs-success-text)' }}>
              <Icon name="checkCircle" size={34} />
            </span>
            <h1 className="text-2xl font-extrabold mt-5">Order received</h1>
            <p className="text-muted mt-2 leading-relaxed px-4">We’re verifying your payment for <strong>{selected?.name}</strong>. Access is usually granted within 24 hours.</p>
            <div className="mt-6 flex justify-center gap-2"><Button href="/" variant="secondary">Back to home</Button><Button href="/login">Sign in</Button></div>
          </div>
        </div>
      ) : (
        <div className="container-x py-10 md:py-14">
          {/* Stepper */}
          <ol className="flex items-center justify-center gap-3 mb-8" aria-label="Checkout progress">
            <StepDot n={1} active={step >= 1} done={step > 1} label="Choose plan" />
            <li aria-hidden className="w-10 sm:w-16 h-px" style={{ background: step >= 2 ? 'var(--rs-primary)' : 'var(--rs-line-strong)' }} />
            <StepDot n={2} active={step >= 2} done={false} label="Payment details" />
          </ol>

          {step === 1 && (
            <>
              <div className="text-center max-w-xl mx-auto mb-10">
                <h1 className="text-[clamp(1.75rem,4vw,2.4rem)] font-extrabold">Choose your plan</h1>
                <p className="text-muted mt-2">One-time course bundles or a monthly signals subscription. Upgrade any time.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                {SERVICES.filter((s) => !s.comingSoon).map((svc) => (
                  <button
                    key={svc.name}
                    onClick={() => { setSelected(svc); setStep(2); window.scrollTo({ top: 0 }) }}
                    className="card card-hover text-left p-6 group relative flex flex-col"
                    style={svc.popular ? { borderColor: 'var(--rs-primary)', boxShadow: 'var(--rs-shadow-md)' } : undefined}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-ink font-bold">{svc.name}</div>
                      {svc.popular ? <span className="pill pill-solid-primary">Most popular</span> : svc.bestValue ? <span className="pill pill-gold">Best value</span> : null}
                    </div>
                    <p className="text-muted text-[13px] mt-1">{svc.description}</p>
                    <div className="flex items-baseline gap-1 mt-4">
                      <span className="num text-ink font-semibold text-3xl">${svc.price}</span>
                      <span className="text-dim text-xs">{svc.monthly ? '/ month' : 'one-time'}</span>
                    </div>
                    <ul className="space-y-2 mt-4 mb-5 flex-1">
                      {svc.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-muted text-[13px]"><Icon name="check" size={15} className="text-primary shrink-0 mt-0.5" /> {f}</li>
                      ))}
                    </ul>
                    <span className="inline-flex items-center gap-1 text-primary text-sm font-semibold">
                      Select plan <Icon name="arrowRight" size={15} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && selected && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] max-w-5xl mx-auto">
              <div className="flex flex-col gap-4 lg:sticky lg:top-6 self-start w-full">
                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <span className="section-title">Order summary</span>
                    <button type="button" className="link text-[13px]" onClick={() => setStep(1)}>Change</button>
                  </div>
                  <div className="text-ink font-bold text-lg mt-3">{selected.name}</div>
                  <div className="flex items-baseline justify-between mt-3 pt-3 border-t hairline">
                    <span className="text-muted text-sm">Total due</span>
                    <span className="num text-ink font-semibold text-2xl">${selected.price}</span>
                  </div>
                  <ul className="space-y-2 mt-4">
                    {selected.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-muted text-[13px]"><Icon name="check" size={15} className="text-primary shrink-0 mt-0.5" /> {f}</li>
                    ))}
                  </ul>
                </div>
                <div className="card p-6">
                  <div className="flex items-center gap-2 text-ink font-semibold"><Icon name="shieldCheck" size={18} className="text-primary" /> How payment works</div>
                  <ol className="mt-4 space-y-3 text-[13px] text-muted">
                    <li className="flex gap-3"><Num n={1} /> <span>Send <strong className="num">${selected.price}</strong> by bank transfer, USDT (TRC20) or another listed method. Contact support for payment details{SUPPORT_WHATSAPP ? <> — WhatsApp <strong>{SUPPORT_WHATSAPP}</strong></> : null}.</span></li>
                    <li className="flex gap-3"><Num n={2} /> <span>Fill in your details and paste the transaction ID or proof of payment.</span></li>
                    <li className="flex gap-3"><Num n={3} /> <span>We verify and activate your access within 24 hours.</span></li>
                  </ol>
                  <p className="text-dim text-xs mt-4">Support: <a href={`mailto:${SUPPORT_EMAIL}`} className="link">{SUPPORT_EMAIL}</a></p>
                </div>
              </div>

              <form onSubmit={submit} className="card p-6 flex flex-col gap-4">
                <h2 className="text-lg font-bold">Your details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2"><label className="field-label" htmlFor="clientName">Full name</label><input id="clientName" className="field" placeholder="Jane Doe" value={form.clientName} onChange={set('clientName')} required autoComplete="name" /></div>
                  <div><label className="field-label" htmlFor="clientEmail">Email</label><input id="clientEmail" className="field" type="email" placeholder="you@example.com" value={form.clientEmail} onChange={set('clientEmail')} required autoComplete="email" /><p className="field-hint">Use the email on your account so we can upgrade it.</p></div>
                  <div><label className="field-label" htmlFor="phone">Phone</label><input id="phone" className="field" type="tel" placeholder="+1 234 567 8900" value={form.phone} onChange={set('phone')} required autoComplete="tel" /></div>
                  <div><label className="field-label" htmlFor="country">Country</label><input id="country" className="field" placeholder="United States" value={form.country} onChange={set('country')} required autoComplete="country-name" /></div>
                  <div><label className="field-label" htmlFor="referralCode">Referral code <span className="text-dim font-normal">(optional)</span></label><input id="referralCode" className="field uppercase" placeholder="XXXX000000" value={form.referralCode} onChange={set('referralCode')} /></div>
                  <div className="sm:col-span-2">
                    <label className="field-label" htmlFor="paymentMethod">Payment method</label>
                    <select id="paymentMethod" className="field" value={form.paymentMethod} onChange={set('paymentMethod')} required>
                      <option value="">Select payment method</option>
                      {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="field-label" htmlFor="paymentNote">Transaction ID / payment proof</label>
                    <textarea id="paymentNote" className="field num !text-sm" rows={3} placeholder="Paste your transaction ID or payment reference" value={form.paymentNote} onChange={set('paymentNote')} required />
                  </div>
                </div>
                {error ? <div className="alert alert-danger" role="alert"><Icon name="alert" size={16} /><span>{error}</span></div> : null}
                <div className="flex gap-3 mt-1">
                  <Button type="button" variant="secondary" icon="arrowLeft" onClick={() => setStep(1)}>Back</Button>
                  <Button type="submit" loading={loading} block>{loading ? 'Submitting…' : `Submit order · $${selected.price}`}</Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StepDot({ n, active, done, label }: { n: number; active: boolean; done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2" aria-current={active && !done ? 'step' : undefined}>
      <span className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold"
        style={active ? { background: 'var(--rs-primary)', color: 'var(--rs-primary-fg)' } : { background: 'var(--rs-surface-2)', color: 'var(--rs-dim)', border: '1px solid var(--rs-line)' }}>
        {done ? <Icon name="check" size={14} strokeWidth={2.5} /> : n}
      </span>
      <span className={`text-[13px] font-semibold ${active ? 'text-ink' : 'text-dim'}`}>{label}</span>
    </li>
  )
}

function Num({ n }: { n: number }) {
  return <span className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold" style={{ background: 'var(--rs-primary-tint)', color: 'var(--rs-primary)' }}>{n}</span>
}
