'use client'
import { useState } from 'react'
import { api, useList, FilterTabs } from '@/components/admin/kit'
import { useFeedback } from '@/components/ui/feedback'
import { PageHeader, EmptyState, ErrorState, SkeletonList, StatusPill, Avatar } from '@/components/ui/states'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'

type Affiliate = { id: string; fullName: string; email: string; username: string; referralCode: string | null; status: string; sales: number; earned: number; createdAt: string }

export default function AdminAffiliatesPage() {
  const { toast } = useFeedback()
  const { data: affiliates, setData: setAffiliates, loading, error, reload } = useList<Affiliate>('/api/admin/affiliates')
  const [filter, setFilter] = useState<'ALL' | 'PENDING'>('ALL')
  const pending = affiliates.filter((a) => a.status === 'PENDING').length

  async function approve(a: Affiliate) {
    try {
      const updated = await api<{ referralCode?: string | null }>('/api/admin/users', 'PATCH', { id: a.id, status: 'APPROVED', role: 'AFFILIATE' })
      setAffiliates((prev) => prev.map((x) => (x.id === a.id ? { ...x, status: 'APPROVED', referralCode: updated.referralCode ?? x.referralCode } : x)))
      toast(`${a.fullName} approved`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not approve', 'error')
    }
  }

  const shown = filter === 'PENDING' ? affiliates.filter((a) => a.status === 'PENDING') : affiliates

  return (
    <div className="fade-in">
      <PageHeader title="Affiliates" subtitle={`${affiliates.length} affiliates · ${pending} pending approval`} />
      <div className="mb-4"><FilterTabs value={filter} onChange={setFilter} options={[{ key: 'ALL', label: 'All', count: affiliates.length }, { key: 'PENDING', label: 'Pending', count: pending }]} /></div>

      {loading ? <SkeletonList rows={4} height={64} /> : error ? <ErrorState description={error} action={<Button variant="secondary" onClick={reload}>Retry</Button>} /> : shown.length === 0 ? (
        <EmptyState icon="gift" title={filter === 'PENDING' ? 'No pending applications' : 'No affiliates yet'} />
      ) : (
        <div className="table-wrap">
          <table className="table !min-w-[820px]">
            <thead><tr><th>Affiliate</th><th>Referral code</th><th className="text-right">Sales</th><th className="text-right">Earned</th><th>Status</th><th className="text-right">Action</th></tr></thead>
            <tbody>
              {shown.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={a.fullName} size={32} />
                      <div className="min-w-0"><div className="text-ink font-semibold truncate">{a.fullName}</div><div className="text-dim text-xs truncate">{a.email} · @{a.username} · {formatDate(a.createdAt)}</div></div>
                    </div>
                  </td>
                  <td className="num text-primary font-semibold">{a.referralCode || '—'}</td>
                  <td className="num text-right">{a.sales}</td>
                  <td className="num text-right font-semibold" style={{ color: 'var(--rs-success-text)' }}>{formatCurrency(a.earned)}</td>
                  <td><StatusPill status={a.status} /></td>
                  <td className="text-right">{a.status === 'PENDING' ? <Button size="sm" variant="success-soft" icon="check" onClick={() => approve(a)}>Approve</Button> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
