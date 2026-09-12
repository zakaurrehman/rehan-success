'use client'
import { useState } from 'react'
import Link from 'next/link'
import AuthShell from '@/components/marketing/AuthShell'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/brand/icons'
import { COUNTRIES, PAYMENT_METHODS } from '@/lib/constants'

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', city: '', country: '',
    username: '', password: '', confirmPassword: '',
    paymentMethod: '', socialHandle: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  const mismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'AFFILIATE' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error || 'Registration failed. Please try again.'); setLoading(false); return }
      setSuccess(true)
    } catch {
      setError('We couldn’t reach the server. Check your connection and try again.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthShell title="Application submitted" subtitle="Thanks for applying to the Rehan Success affiliate program.">
        <div className="card text-center py-10">
          <span className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--rs-success-tint)', color: 'var(--rs-success-text)' }}>
            <Icon name="checkCircle" size={34} />
          </span>
          <p className="text-ink font-semibold mt-5">Your account is under review</p>
          <p className="text-muted text-sm mt-2 max-w-xs mx-auto leading-relaxed">We’ll approve new affiliates as quickly as possible. You can sign in as soon as your account is approved.</p>
          <div className="mt-6"><Button href="/login" iconRight="arrowRight">Go to sign in</Button></div>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell wide title="Become an affiliate" subtitle={<>Earn 50% commission on every plan you refer. Already approved? <Link href="/login" className="link">Sign in</Link></>}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="section-title mb-3 sm:col-span-2">Personal details</legend>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="fullName">Full name <Req /></label>
            <input id="fullName" className="field" placeholder="Jane Doe" value={form.fullName} onChange={set('fullName')} required autoComplete="name" />
          </div>
          <div>
            <label className="field-label" htmlFor="email">Email <Req /></label>
            <input id="email" className="field" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required autoComplete="email" />
          </div>
          <div>
            <label className="field-label" htmlFor="phone">Phone <Req /></label>
            <input id="phone" className="field" type="tel" placeholder="+1 234 567 8900" value={form.phone} onChange={set('phone')} required autoComplete="tel" />
          </div>
          <div>
            <label className="field-label" htmlFor="country">Country <Req /></label>
            <select id="country" className="field" value={form.country} onChange={set('country')} required>
              <option value="">Select your country</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="city">City <Opt /></label>
            <input id="city" className="field" placeholder="New York" value={form.city} onChange={set('city')} autoComplete="address-level2" />
          </div>
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="section-title mb-3 sm:col-span-2">Account</legend>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="username">Username <Req /></label>
            <input id="username" className="field" placeholder="janedoe" value={form.username} onChange={set('username')} required autoComplete="username" autoCapitalize="none" spellCheck={false} />
          </div>
          <div>
            <label className="field-label" htmlFor="password">Password <Req /></label>
            <input id="password" className="field" type="password" placeholder="At least 8 characters" value={form.password} onChange={set('password')} required minLength={8} autoComplete="new-password" />
            <p className="field-hint">{form.password.length >= 8 ? '✓ Length looks good' : 'Minimum 8 characters'}</p>
          </div>
          <div>
            <label className="field-label" htmlFor="confirmPassword">Confirm password <Req /></label>
            <input id="confirmPassword" className="field" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={set('confirmPassword')} required autoComplete="new-password" aria-invalid={mismatch || undefined} />
            {mismatch ? <p className="field-error">Passwords don’t match yet</p> : null}
          </div>
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="section-title mb-3 sm:col-span-2">Payouts</legend>
          <div>
            <label className="field-label" htmlFor="paymentMethod">Preferred payout method <Req /></label>
            <select id="paymentMethod" className="field" value={form.paymentMethod} onChange={set('paymentMethod')} required>
              <option value="">Select a method</option>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="socialHandle">Social handle <Opt /></label>
            <input id="socialHandle" className="field" placeholder="@yourhandle" value={form.socialHandle} onChange={set('socialHandle')} />
          </div>
        </fieldset>

        {error ? (
          <div className="alert alert-danger" role="alert"><Icon name="alert" size={16} /><span>{error}</span></div>
        ) : null}

        <div>
          <Button type="submit" loading={loading} block size="lg" iconRight="arrowRight">
            {loading ? 'Submitting…' : 'Submit application'}
          </Button>
          <p className="text-dim text-xs text-center mt-3">By applying you agree to our <Link href="/privacy" className="link">privacy policy</Link>.</p>
        </div>
      </form>
    </AuthShell>
  )
}

function Req() { return <span className="text-danger-text" aria-hidden="true">*</span> }
function Opt() { return <span className="text-dim font-normal">(optional)</span> }
