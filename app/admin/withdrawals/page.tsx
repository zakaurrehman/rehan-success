'use client'
import { useState } from 'react'
import { api, useList, FilterTabs } from '@/components/admin/kit'
import { useFeedback } from '@/components/ui/feedback'
import { PageHeader, EmptyState, ErrorState, SkeletonList, StatusPill, Avatar } from '@/components/ui/states'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDateTime } from '@/lib/utils'

type Request = { id: string; amount: number; status: string; note: string | null; createdAt: string; affiliate: { fullName: string; paymentMethod: string | null; email: string } }
type Filter = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED' | 'ALL'

export default function AdminWithdrawalsPage() {
  const { toast, confirm } = useFeedback()
  const { data: requests, setData: setRequests, loading, error, reload } = useList<Request>('/api/admin/withdrawals')
  const [filter, setFilter] = useState<Filter>('PENDING')
  const [busy, setBusy] = useState<string | null>(null)

  async function update(r: Request, status: string) {
    if (status === 'PAID') {
      const ok = await confirm({ title: `Mark ${formatCurrency(r.amount)} as paid?`, message: `Confirm you have sent the payout to ${r.affiliate.fullName}. Their unpaid commissions will be marked as withdrawn and they’ll be notified.`, confirmLabel: 'Mark as paid', tone: 'primary' })
      if (!ok) return
    }
    if (status === 'REJECTED') {
      const ok = await confirm({ title: 'Reject this withdrawal?', message: `${r.affiliate.fullName} requested ${formatCurrency(r.amount)}.`, confirmLabel: 'Reject' })
      if (!ok) return
    }
    setBusy(r.id)
    try {
      const updated = await api<Partial<Request>>('/api/admin/withdrawals', 'PATCH', { id: r.id, status })
      setRequests((prev) => prev.map((x) => (x.id === r.id ? { ...x, ...updated, affiliate: x.affiliate } : x)))
      toast(status === 'PAID' ? 'Payout recorded' : status === 'APPROVED' ? 'Request approved' : 'Request rejected')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed', 'error')
    } finally {
      setBusy(null)
    }
  }

  const count = (s: string) => requests.filter((r) => r.status === s).length
  const shown = requests.filter((r) => filter === 'ALL' || r.status === filter)
  const pendingTotal = requests.filter((r) => r.status === 'PENDING').reduce((s, r) => s + r.amount, 0)

  return (
    <div className="fade-in">
      <PageHeader title="Withdrawals" subtitle={`${count('PENDING')} pending · ${formatCurrency(pendingTotal)} requested`} />
      <div className="mb-4">
        <FilterTabs value={filter} onChange={setFilter} options={[{ key: 'PENDING', label: 'Pending', count: count('PENDING') }, { key: 'APPROVED', label: 'Approved', count: count('APPROVED') }, { key: 'PAID', label: 'Paid', count: count('PAID') }, { key: 'REJECTED', label: 'Rejected', count: count('REJECTED') }, { key: 'ALL', label: 'All', count: requests.length }]} />
      </div>

      {loading ? <SkeletonList rows={3} height={110} /> : error ? <ErrorState description={error} action={<Button variant="secondary" onClick={reload}>Retry</Button>} /> : shown.length === 0 ? (
        <EmptyState icon="wallet" title="No withdrawal requests here" />
      ) : (
        <div className="flex flex-col gap-3">
          {shown.map((r) => (
            <article key={r.id} className="card-flat p-5" style={r.status === 'PENDING' ? { borderColor: 'var(--rs-warning-line)' } : undefined}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={r.affiliate.fullName} size={40} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap"><h2 className="text-ink font-bold">{r.affiliate.fullName}</h2><StatusPill status={r.status} /></div>
                    <div className="text-muted text-sm truncate">{r.affiliate.email} · Payout via {r.affiliate.paymentMethod || 'not specified'}</div>
                    <div className="text-dim text-xs">{formatDateTime(r.createdAt)}</div>
                  </div>
                </div>
                <div className="num text-ink text-2xl font-semibold">{formatCurrency(r.amount)}</div>
              </div>
              {r.note ? <div className="card-sub mt-3"><div className="level-label">Payout details</div><div className="text-ink text-sm mt-1 break-words">{r.note}</div></div> : null}
              {r.status === 'PENDING' || r.status === 'APPROVED' ? (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t hairline">
                  {r.status === 'PENDING' ? <Button size="sm" variant="outline" icon="check" disabled={busy === r.id} onClick={() => update(r, 'APPROVED')}>Approve</Button> : null}
                  <Button size="sm" variant="success" icon="wallet" loading={busy === r.id} onClick={() => update(r, 'PAID')}>Mark paid</Button>
                  {r.status === 'PENDING' ? <Button size="sm" variant="danger-soft" disabled={busy === r.id} onClick={() => update(r, 'REJECTED')}>Reject</Button> : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
