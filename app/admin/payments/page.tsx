'use client'
import { useState } from 'react'
import { api, useList, FilterTabs } from '@/components/admin/kit'
import { useFeedback } from '@/components/ui/feedback'
import { PageHeader, EmptyState, ErrorState, SkeletonList, StatusPill } from '@/components/ui/states'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/brand/icons'
import { formatCurrency, formatDateTime } from '@/lib/utils'

type Payment = {
  id: string; clientName: string; clientEmail: string; phone: string | null
  country: string | null; service: string; amount: number; status: string
  referralCode: string | null; paymentMethod: string | null; paymentNote: string | null; rejectedNote?: string | null; createdAt: string
}

/** Mirrors the server mapping in /api/admin/payments (display only). */
function serviceToPlan(service: string) {
  const s = service.toLowerCase()
  if (s.includes('mentorship') || s.includes('mastery') || s.includes('advanced trading')) return 'PREMIUM'
  return 'BASIC'
}

const SERVICES = ['Basic Training', 'Premium Signals', 'Advanced Trading Strategies', 'Mastery Bundle', 'Personal Mentorship']
type StatusFilter = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'ALL'

export default function AdminPaymentsPage() {
  const { toast, confirm, prompt } = useFeedback()
  const { data: payments, setData: setPayments, loading, error, reload } = useList<Payment>('/api/admin/payments')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING')
  const [serviceFilter, setServiceFilter] = useState('ALL')
  const [busy, setBusy] = useState<string | null>(null)

  async function confirmPayment(p: Payment) {
    const plan = serviceToPlan(p.service)
    const ok = await confirm({
      title: `Confirm ${formatCurrency(p.amount)} from ${p.clientName}?`,
      message: `• Activates the ${plan} plan for ${p.clientEmail} (if they have an account)\n• Records a sale${p.referralCode ? `\n• Credits a 50% commission to referral code ${p.referralCode}` : ''}`,
      confirmLabel: `Confirm & activate ${plan}`,
      tone: 'primary',
    })
    if (!ok) return
    await update(p, 'CONFIRMED')
  }

  async function rejectPayment(p: Payment) {
    const note = await prompt({ title: `Reject payment from ${p.clientName}?`, label: 'Reason (optional)', placeholder: 'e.g. Transaction ID not found', confirmLabel: 'Reject payment' })
    if (note === null) return
    await update(p, 'REJECTED', note)
  }

  async function update(p: Payment, status: string, rejectedNote?: string) {
    setBusy(p.id)
    try {
      await api('/api/admin/payments', 'PATCH', { id: p.id, status, rejectedNote })
      setPayments((prev) => prev.map((x) => (x.id === p.id ? { ...x, status, rejectedNote: rejectedNote ?? x.rejectedNote } : x)))
      toast(status === 'CONFIRMED' ? 'Payment confirmed — plan activated' : 'Payment rejected')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed', 'error')
    } finally {
      setBusy(null)
    }
  }

  const filtered = payments.filter((p) => (statusFilter === 'ALL' || p.status === statusFilter) && (serviceFilter === 'ALL' || p.service === serviceFilter))
  const count = (s: string) => payments.filter((p) => p.status === s).length

  return (
    <div className="fade-in">
      <PageHeader title="Payment requests" subtitle={count('PENDING') ? `${count('PENDING')} awaiting confirmation · ${payments.length} total` : `All payments reviewed · ${payments.length} total`} />

      <div className="flex gap-2.5 scroll-x pb-1 mb-4">
        {SERVICES.map((svc) => {
          const n = payments.filter((p) => p.service === svc).length
          const active = serviceFilter === svc
          return (
            <button key={svc} type="button" onClick={() => setServiceFilter(active ? 'ALL' : svc)} aria-pressed={active}
              className="card-flat text-left px-3.5 py-2.5 shrink-0 min-w-[150px] transition-colors"
              style={active ? { borderColor: 'var(--rs-primary)', background: 'var(--rs-primary-tint)' } : undefined}>
              <div className="text-dim text-[10px] font-bold tracking-wider">{serviceToPlan(svc)}</div>
              <div className="text-ink text-[13px] font-semibold leading-tight mt-0.5">{svc}</div>
              <div className="num text-primary text-lg font-semibold mt-1">{n}</div>
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FilterTabs value={statusFilter} onChange={setStatusFilter} options={[{ key: 'PENDING', label: 'Pending', count: count('PENDING') }, { key: 'CONFIRMED', label: 'Confirmed', count: count('CONFIRMED') }, { key: 'REJECTED', label: 'Rejected', count: count('REJECTED') }, { key: 'ALL', label: 'All', count: payments.length }]} />
        {serviceFilter !== 'ALL' ? <button type="button" className="chip" onClick={() => setServiceFilter('ALL')}><Icon name="close" size={13} /> {serviceFilter}</button> : null}
      </div>

      {loading ? <SkeletonList rows={3} height={150} /> : error ? <ErrorState description={error} action={<Button variant="secondary" onClick={reload}>Retry</Button>} /> : filtered.length === 0 ? (
        <EmptyState icon="card" title="No payments match these filters" />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((p) => {
            const plan = serviceToPlan(p.service)
            return (
              <article key={p.id} className="card-flat p-5" style={p.status === 'PENDING' ? { borderColor: 'var(--rs-warning-line)', boxShadow: 'var(--rs-shadow-xs)' } : { boxShadow: 'var(--rs-shadow-xs)' }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap"><h2 className="text-ink font-bold text-base">{p.clientName}</h2><StatusPill status={p.status} /></div>
                    <div className="text-muted text-sm mt-0.5 break-all">{p.clientEmail}{p.phone ? ` · ${p.phone}` : ''}{p.country ? ` · ${p.country}` : ''}</div>
                    <div className="text-dim text-xs mt-0.5">{formatDateTime(p.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="num text-ink text-2xl font-semibold">{formatCurrency(p.amount)}</div>
                    <div className="text-dim text-xs">{p.service}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className={`pill ${plan === 'PREMIUM' ? 'pill-gold' : 'pill-primary'}`}>Activates {plan}</span>
                  {p.paymentMethod ? <span className="pill pill-neutral"><Icon name="card" size={11} /> {p.paymentMethod}</span> : null}
                  {p.referralCode ? <span className="pill pill-success"><Icon name="gift" size={11} /> Ref {p.referralCode}</span> : null}
                </div>

                {p.paymentNote ? (
                  <div className="card-sub mt-3">
                    <div className="level-label">Transaction ID / payment proof</div>
                    <div className="num text-ink text-sm break-all mt-1">{p.paymentNote}</div>
                  </div>
                ) : null}
                {p.status === 'REJECTED' && p.rejectedNote ? <p className="text-sm mt-3" style={{ color: 'var(--rs-danger-text)' }}>Reason: {p.rejectedNote}</p> : null}

                {p.status === 'PENDING' ? (
                  <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t hairline">
                    <Button variant="success" icon="check" loading={busy === p.id} onClick={() => confirmPayment(p)} className="sm:flex-1">Confirm & activate {plan}</Button>
                    <Button variant="danger-soft" icon="close" disabled={busy === p.id} onClick={() => rejectPayment(p)} className="sm:flex-1">Reject</Button>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
