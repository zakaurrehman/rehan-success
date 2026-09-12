'use client'
import { useCallback, useEffect, useState } from 'react'
import { PageHeader, StatusPill, SkeletonList, EmptyState, ErrorState } from '@/components/ui/states'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/brand/icons'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useFeedback } from '@/components/ui/feedback'

type Req = { id: string; amount: number; status: string; note?: string | null; createdAt: string }

export default function WithdrawPage() {
  const { toast } = useFeedback()
  const [available, setAvailable] = useState(0)
  const [requests, setRequests] = useState<Req[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    fetch('/api/withdrawals')
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then((d) => { setAvailable(d.available || 0); setRequests(d.requests || []); setStatus('ready') })
      .catch(() => setStatus('error'))
  }, [])

  useEffect(() => { load() }, [load])

  const value = parseFloat(amount)
  const tooMuch = !Number.isNaN(value) && value > available
  const invalid = Number.isNaN(value) || value <= 0

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (invalid || tooMuch) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/withdrawals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: value, note }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Request failed')
      toast('Withdrawal request submitted')
      setAmount('')
      setNote('')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Withdraw earnings" subtitle="Payouts are reviewed and processed within 24–48 hours." back={{ href: '/affiliate', label: 'Affiliate' }} />

      {status === 'error' ? (
        <ErrorState title="Couldn’t load your balance" action={<Button variant="secondary" icon="refresh" onClick={() => { setStatus('loading'); load() }}>Try again</Button>} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-5">
            <section className="rounded-[1.25rem] p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(140deg, #0f766e 0%, #0b3f3b 60%, #0b1020 100%)' }}>
              <div className="text-white/70 text-sm">Available balance</div>
              {status === 'loading' ? <div className="h-11 w-40 rounded-lg bg-white/15 mt-2 animate-pulse" /> : <div className="num text-4xl font-semibold mt-1 tracking-tight">{formatCurrency(available)}</div>}
              <div className="text-white/60 text-xs mt-3 inline-flex items-center gap-1.5"><Icon name="shieldCheck" size={14} /> Only unpaid commissions count toward your balance</div>
            </section>

            <form onSubmit={submit} className="card flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="field-label !mb-0" htmlFor="amount">Amount</label>
                  <button type="button" className="link text-xs" onClick={() => setAmount(available.toFixed(2))} disabled={!available}>Withdraw max</button>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim">$</span>
                  <input id="amount" className="field num pl-7 !text-lg" type="number" inputMode="decimal" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required aria-invalid={tooMuch || undefined} />
                </div>
                {tooMuch ? <p className="field-error">Amount exceeds your available balance of {formatCurrency(available)}.</p> : null}
              </div>
              <div>
                <label className="field-label" htmlFor="note">Payout details</label>
                <textarea id="note" className="field" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. USDT TRC20: TXxx… or Bank: Jane Doe, Acct 1234" />
                <p className="field-hint">Where should we send the money?</p>
              </div>
              {error ? <div className="alert alert-danger" role="alert"><Icon name="alert" size={16} /><span>{error}</span></div> : null}
              <Button type="submit" loading={loading} disabled={invalid || tooMuch || status !== 'ready'} block size="lg" icon="send">
                {loading ? 'Submitting…' : 'Request withdrawal'}
              </Button>
            </form>
          </div>

          <section>
            <h2 className="section-title mb-3">Request history</h2>
            {status === 'loading' ? (
              <SkeletonList rows={3} height={64} />
            ) : requests.length === 0 ? (
              <EmptyState compact icon="wallet" title="No requests yet" description="Your withdrawal requests and their status will appear here." />
            ) : (
              <ul className="card-flat">
                {requests.map((r, i) => (
                  <li key={r.id} className={`flex items-center justify-between gap-3 px-4 py-3.5 ${i ? 'border-t hairline' : ''}`}>
                    <div className="min-w-0">
                      <div className="num text-ink font-semibold">{formatCurrency(r.amount)}</div>
                      <div className="text-dim text-xs truncate">{formatDate(r.createdAt)}{r.note ? ` · ${r.note}` : ''}</div>
                    </div>
                    <StatusPill status={r.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
