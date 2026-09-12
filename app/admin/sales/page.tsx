'use client'
import { useState } from 'react'
import { api, useList, F } from '@/components/admin/kit'
import { useFeedback } from '@/components/ui/feedback'
import { PageHeader, EmptyState, SkeletonList } from '@/components/ui/states'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'

type Affiliate = { id: string; fullName: string; username: string }
type Sale = { id: string; clientName: string; clientEmail: string; amount: number; description?: string | null; createdAt: string; affiliate: { fullName: string } }
const EMPTY = { affiliateId: '', clientName: '', clientEmail: '', amount: '', description: '' }

export default function AdminSalesPage() {
  const { toast } = useFeedback()
  const { data: affiliates } = useList<Affiliate>('/api/admin/affiliates-list')
  const { data: sales, setData: setSales, loading } = useList<Sale>('/api/admin/sales')
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const amount = parseFloat(form.amount)
  const commission = Number.isFinite(amount) ? amount * 0.5 : 0

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const sale = await api<Sale>('/api/admin/sales', 'POST', { ...form, amount: +form.amount })
      setSales((prev) => [sale, ...prev])
      setForm(EMPTY)
      toast('Sale logged — commission created and affiliate notified')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not log sale', 'error')
    } finally {
      setSaving(false)
    }
  }

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fade-in">
      <PageHeader title="Log a sale" subtitle="Manually record a sale for an affiliate. A 50% commission is created automatically." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form onSubmit={submit} className="card flex flex-col gap-3 self-start">
          <h2 className="text-base font-bold">New sale</h2>
          <F label="Affiliate" htmlFor="sale-aff">
            <select id="sale-aff" className="field" value={form.affiliateId} onChange={set('affiliateId')} required>
              <option value="">Select an approved affiliate…</option>
              {affiliates.map((a) => <option key={a.id} value={a.id}>{a.fullName} (@{a.username})</option>)}
            </select>
          </F>
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="Client name" htmlFor="sale-name"><input id="sale-name" className="field" value={form.clientName} onChange={set('clientName')} placeholder="Jane Doe" required /></F>
            <F label="Client email" htmlFor="sale-email"><input id="sale-email" className="field" type="email" value={form.clientEmail} onChange={set('clientEmail')} placeholder="client@email.com" required /></F>
          </div>
          <F label="Sale amount (USD)" htmlFor="sale-amt"><input id="sale-amt" className="field num" type="number" step="0.01" min="0" value={form.amount} onChange={set('amount')} placeholder="103.00" required /></F>
          <F label="Description (optional)" htmlFor="sale-desc"><input id="sale-desc" className="field" value={form.description} onChange={set('description')} placeholder="Advanced Strategies package" /></F>
          <div className="card-sub flex items-center justify-between">
            <span className="text-muted text-sm">Commission to affiliate (50%)</span>
            <span className="num font-semibold" style={{ color: 'var(--rs-success-text)' }}>{formatCurrency(commission)}</span>
          </div>
          <Button type="submit" loading={saving} icon="check" block>Log sale</Button>
        </form>

        <section>
          <h2 className="section-title mb-3">Recent sales</h2>
          {loading ? <SkeletonList rows={5} height={56} /> : sales.length === 0 ? (
            <EmptyState compact icon="trendingUp" title="No sales yet" />
          ) : (
            <ul className="card-flat">
              {sales.slice(0, 15).map((s, i) => (
                <li key={s.id} className={`flex items-center justify-between gap-3 px-4 py-3 ${i ? 'border-t hairline' : ''}`}>
                  <div className="min-w-0">
                    <div className="text-ink text-sm font-semibold truncate">{s.clientName}</div>
                    <div className="text-dim text-xs truncate">via {s.affiliate.fullName} · {formatDate(s.createdAt)}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="num text-ink text-sm font-semibold">{formatCurrency(s.amount)}</div>
                    <div className="num text-xs" style={{ color: 'var(--rs-success-text)' }}>+{formatCurrency(s.amount * 0.5)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
