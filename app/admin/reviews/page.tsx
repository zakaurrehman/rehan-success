'use client'
import { useState } from 'react'
import { api, useList, FilterTabs } from '@/components/admin/kit'
import { useFeedback } from '@/components/ui/feedback'
import { PageHeader, EmptyState, ErrorState, SkeletonList, StatusPill, Avatar } from '@/components/ui/states'
import { Button } from '@/components/ui/Button'
import { StarDisplay } from '@/components/StarRating'
import { formatDate } from '@/lib/utils'

type Review = { id: string; clientName: string; email: string | null; rating: number; content: string; status: string; createdAt: string }
type Filter = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'

export default function AdminReviewsPage() {
  const { toast } = useFeedback()
  const { data: reviews, setData: setReviews, loading, error, reload } = useList<Review>('/api/reviews?all=1')
  const [filter, setFilter] = useState<Filter>('PENDING')

  async function update(r: Review, status: string) {
    try {
      await api('/api/reviews', 'PATCH', { id: r.id, status })
      setReviews((prev) => prev.map((x) => (x.id === r.id ? { ...x, status } : x)))
      toast(status === 'APPROVED' ? 'Review published' : 'Review rejected')
    } catch {
      toast('Update failed', 'error')
    }
  }

  const count = (s: string) => reviews.filter((r) => r.status === s).length
  const shown = reviews.filter((r) => filter === 'ALL' || r.status === filter)

  return (
    <div className="fade-in">
      <PageHeader title="Reviews" subtitle={`${count('PENDING')} awaiting moderation`} />
      <div className="mb-4"><FilterTabs value={filter} onChange={setFilter} options={[{ key: 'PENDING', label: 'Pending', count: count('PENDING') }, { key: 'APPROVED', label: 'Published', count: count('APPROVED') }, { key: 'REJECTED', label: 'Rejected', count: count('REJECTED') }, { key: 'ALL', label: 'All', count: reviews.length }]} /></div>

      {loading ? <SkeletonList rows={3} height={140} /> : error ? <ErrorState description={error} action={<Button variant="secondary" onClick={reload}>Retry</Button>} /> : shown.length === 0 ? (
        <EmptyState icon="star" title="Nothing to moderate here" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {shown.map((r) => (
            <article key={r.id} className="card-flat p-5 flex flex-col" style={r.status === 'PENDING' ? { borderColor: 'var(--rs-warning-line)' } : undefined}>
              <div className="flex items-center justify-between gap-2">
                <StarDisplay rating={r.rating} />
                <StatusPill status={r.status === 'APPROVED' ? 'PUBLISHED' : r.status} label={r.status === 'APPROVED' ? 'Published' : undefined} />
              </div>
              <p className="text-text text-sm leading-relaxed my-3 flex-1">“{r.content}”</p>
              <div className="flex items-center gap-2.5">
                <Avatar name={r.clientName} size={30} />
                <div className="min-w-0"><div className="text-ink text-sm font-semibold">{r.clientName}</div><div className="text-dim text-xs truncate">{r.email || 'No email'} · {formatDate(r.createdAt)}</div></div>
              </div>
              {r.status === 'PENDING' ? (
                <div className="flex gap-2 mt-4 pt-4 border-t hairline">
                  <Button size="sm" variant="success-soft" icon="check" className="flex-1" onClick={() => update(r, 'APPROVED')}>Publish</Button>
                  <Button size="sm" variant="danger-soft" icon="close" className="flex-1" onClick={() => update(r, 'REJECTED')}>Reject</Button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
