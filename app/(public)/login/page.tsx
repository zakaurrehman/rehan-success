'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthShell from '@/components/marketing/AuthShell'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/brand/icons'
import { Modal } from '@/components/ui/feedback'
import { SUPPORT_EMAIL } from '@/lib/site'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { ...form, redirect: false })
    if (res?.error) {
      setError('We couldn’t sign you in. Check your username/email and password — new accounts also need approval before first sign-in.')
      setLoading(false)
      return
    }
    const session = await fetch('/api/auth/session').then((r) => r.json())
    if (session?.user?.role === 'ADMIN') router.push('/admin')
    else router.push('/dashboard')
    router.refresh()
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your trading workspace.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate={false}>
        <div>
          <label className="field-label" htmlFor="username">Username or email</label>
          <input
            id="username"
            className="field"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            placeholder="you@example.com"
            required
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="field-label !mb-0" htmlFor="password">Password</label>
            <button type="button" onClick={() => setHelpOpen(true)} className="link text-[13px]">Forgot password?</button>
          </div>
          <div className="relative">
            <input
              id="password"
              className="field pr-11"
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-icon"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              <Icon name={showPw ? 'eyeOff' : 'eye'} size={18} />
            </button>
          </div>
        </div>

        {error ? (
          <div className="alert alert-danger" role="alert">
            <Icon name="alert" size={16} /> <span>{error}</span>
          </div>
        ) : null}

        <Button type="submit" loading={loading} block size="lg" className="mt-1">
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t hairline grid gap-3 text-sm">
        <p className="text-muted">
          New to Rehan Success? <Link href="/order" className="link">Choose a plan</Link>
        </p>
        <p className="text-muted">
          Want to earn commissions? <Link href="/register" className="link">Apply as an affiliate</Link>
        </p>
      </div>

      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Reset your password">
        <p className="text-muted text-sm leading-relaxed">
          For your security, password resets are handled by our support team. Email us from the address registered on your account and we’ll verify your identity and help you regain access.
        </p>
        <div className="card-sub mt-4 flex items-center gap-3">
          <Icon name="mail" size={18} className="text-primary" />
          <a href={`mailto:${SUPPORT_EMAIL}?subject=Password%20reset%20request`} className="link break-all">{SUPPORT_EMAIL}</a>
        </div>
        <div className="flex justify-end mt-6">
          <Button variant="secondary" onClick={() => setHelpOpen(false)}>Got it</Button>
        </div>
      </Modal>
    </AuthShell>
  )
}
