import React, { useState } from 'react'
import { ScrollView } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/hooks'
import { apiFetch } from '@/api/client'
import { Screen, Loader, ErrorState, EmptyState, Button, StatusPill, Chip, spacing } from '@/components/ui'
import { AdminRow } from '@/components/AdminRow'
import type { Review } from '@/types'

export default function AdminReviewsScreen() {
  const qc = useQueryClient()
  const { data, isLoading, isError, refetch, isRefetching } = useApi<Review[]>('/api/reviews?all=1')
  const [filter, setFilter] = useState<'PENDING' | 'ALL'>('PENDING')
  const list = data ?? []

  async function setStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    await apiFetch('/api/reviews', { method: 'PATCH', body: { id, status } }).catch(() => {})
    qc.invalidateQueries({ queryKey: ['/api/reviews?all=1'] })
    qc.invalidateQueries({ queryKey: ['/api/reviews'] })
  }

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError) return <Screen><ErrorState message="Couldn’t load reviews" onRetry={() => refetch()} /></Screen>

  const shown = filter === 'PENDING' ? list.filter((r) => r.status === 'PENDING') : list

  return (
    <Screen scroll padded refreshing={isRefetching} onRefresh={refetch}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: spacing.md }}>
        <Chip label={`Pending (${list.filter((r) => r.status === 'PENDING').length})`} active={filter === 'PENDING'} onPress={() => setFilter('PENDING')} />
        <Chip label={`All (${list.length})`} active={filter === 'ALL'} onPress={() => setFilter('ALL')} />
      </ScrollView>
      {shown.length === 0 ? (
        <EmptyState icon="star-outline" title="Nothing to moderate" />
      ) : (
        shown.map((r) => (
          <AdminRow key={r.id} title={`${r.clientName}  ${'★'.repeat(r.rating)}`} subtitle={r.content} badge={<StatusPill status={r.status} />}>
            {r.status !== 'APPROVED' ? <Button title="Publish" size="sm" variant="successSoft" icon="checkmark" block={false} onPress={() => setStatus(r.id, 'APPROVED')} /> : null}
            {r.status !== 'REJECTED' ? <Button title="Reject" size="sm" variant="dangerSoft" block={false} onPress={() => setStatus(r.id, 'REJECTED')} /> : null}
          </AdminRow>
        ))
      )}
    </Screen>
  )
}
