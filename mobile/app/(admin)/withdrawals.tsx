import React, { useState } from 'react'
import { Alert, ScrollView } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/hooks'
import { apiFetch } from '@/api/client'
import { Screen, Loader, ErrorState, EmptyState, Button, StatusPill, Chip, spacing } from '@/components/ui'
import { AdminRow } from '@/components/AdminRow'
import { formatDate, formatCurrency } from '@/lib/format'

type Withdrawal = { id: string; amount: number; status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED'; note?: string | null; createdAt: string; affiliate?: { fullName: string; email: string; paymentMethod?: string | null } }

export default function AdminWithdrawalsScreen() {
  const qc = useQueryClient()
  const { data, isLoading, isError, refetch, isRefetching } = useApi<Withdrawal[]>('/api/admin/withdrawals')
  const [filter, setFilter] = useState<'OPEN' | 'ALL'>('OPEN')
  const list = data ?? []

  async function setStatus(w: Withdrawal, status: Withdrawal['status']) {
    const go = async () => { await apiFetch('/api/admin/withdrawals', { method: 'PATCH', body: { id: w.id, status } }).catch(() => {}); qc.invalidateQueries({ queryKey: ['/api/admin/withdrawals'] }) }
    if (status === 'PAID') {
      Alert.alert(`Mark ${formatCurrency(w.amount)} as paid?`, `Confirm the payout was sent to ${w.affiliate?.fullName ?? 'the affiliate'}. Their unpaid commissions will be marked as withdrawn.`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Mark paid', onPress: go }])
    } else if (status === 'REJECTED') {
      Alert.alert('Reject withdrawal?', undefined, [{ text: 'Cancel', style: 'cancel' }, { text: 'Reject', style: 'destructive', onPress: go }])
    } else go()
  }

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError) return <Screen><ErrorState message="Couldn’t load withdrawals" onRetry={() => refetch()} /></Screen>

  const open = list.filter((w) => w.status === 'PENDING' || w.status === 'APPROVED')
  const shown = filter === 'OPEN' ? open : list

  return (
    <Screen scroll padded refreshing={isRefetching} onRefresh={refetch}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: spacing.md }}>
        <Chip label={`Open (${open.length})`} active={filter === 'OPEN'} onPress={() => setFilter('OPEN')} />
        <Chip label={`All (${list.length})`} active={filter === 'ALL'} onPress={() => setFilter('ALL')} />
      </ScrollView>
      {shown.length === 0 ? (
        <EmptyState icon="wallet-outline" title="No withdrawal requests" />
      ) : (
        shown.map((w) => (
          <AdminRow key={w.id} title={`${w.affiliate?.fullName ?? '—'} · ${formatCurrency(w.amount)}`}
            subtitle={`${w.affiliate?.email ?? ''} · ${w.affiliate?.paymentMethod ?? 'No payout method'} · ${formatDate(w.createdAt)}${w.note ? `\n${w.note}` : ''}`}
            badge={<StatusPill status={w.status} />}>
            {w.status === 'PENDING' ? <Button title="Approve" size="sm" variant="outline" block={false} onPress={() => setStatus(w, 'APPROVED')} /> : null}
            {w.status === 'PENDING' || w.status === 'APPROVED' ? <Button title="Mark paid" size="sm" variant="success" icon="wallet-outline" block={false} onPress={() => setStatus(w, 'PAID')} /> : null}
            {w.status === 'PENDING' || w.status === 'APPROVED' ? <Button title="Reject" size="sm" variant="dangerSoft" block={false} onPress={() => setStatus(w, 'REJECTED')} /> : null}
          </AdminRow>
        ))
      )}
    </Screen>
  )
}
