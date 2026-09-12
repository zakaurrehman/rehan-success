import React, { useState } from 'react'
import { Alert, ScrollView, View } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/hooks'
import { apiFetch } from '@/api/client'
import { Screen, Loader, ErrorState, EmptyState, Button, StatusPill, Badge, Chip, T, useTheme, spacing, radius } from '@/components/ui'
import { AdminRow } from '@/components/AdminRow'
import { PromptModal } from '@/components/PromptModal'
import { formatCurrency, formatDate } from '@/lib/format'

type Payment = {
  id: string; clientName: string; clientEmail: string; service: string; amount: number
  referralCode?: string | null; paymentMethod?: string | null; paymentNote?: string | null
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED'; rejectedNote?: string | null; createdAt: string
}

/** Mirrors the server mapping (display only). */
function serviceToPlan(service: string) {
  const s = service.toLowerCase()
  if (s.includes('mentorship') || s.includes('mastery') || s.includes('advanced trading')) return 'PREMIUM'
  return 'BASIC'
}

export default function AdminPaymentsScreen() {
  const qc = useQueryClient()
  const { c } = useTheme()
  const { data, isLoading, isError, refetch, isRefetching } = useApi<Payment[]>('/api/admin/payments')
  const [filter, setFilter] = useState<'PENDING' | 'ALL'>('PENDING')
  const [rejecting, setRejecting] = useState<Payment | null>(null)
  const list = data ?? []

  async function setStatus(id: string, status: 'CONFIRMED' | 'REJECTED', rejectedNote?: string) {
    await apiFetch('/api/admin/payments', { method: 'PATCH', body: { id, status, rejectedNote } }).catch(() => {})
    qc.invalidateQueries({ queryKey: ['/api/admin/payments'] })
  }

  function confirm(p: Payment) {
    const plan = serviceToPlan(p.service)
    Alert.alert(`Confirm ${formatCurrency(p.amount)}?`, `Activates ${plan} for ${p.clientEmail} and records a sale${p.referralCode ? ` with a 50% commission for ${p.referralCode}` : ''}.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: `Confirm & activate`, onPress: () => setStatus(p.id, 'CONFIRMED') },
    ])
  }

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError) return <Screen><ErrorState message="Couldn’t load payments" onRetry={() => refetch()} /></Screen>

  const pending = list.filter((p) => p.status === 'PENDING')
  const shown = filter === 'PENDING' ? pending : list

  return (
    <Screen scroll padded refreshing={isRefetching} onRefresh={refetch}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: spacing.md }}>
        <Chip label={`Pending (${pending.length})`} active={filter === 'PENDING'} onPress={() => setFilter('PENDING')} />
        <Chip label={`All (${list.length})`} active={filter === 'ALL'} onPress={() => setFilter('ALL')} />
      </ScrollView>
      {shown.length === 0 ? (
        <EmptyState icon="card-outline" title="No payment requests" />
      ) : (
        shown.map((p) => {
          const plan = serviceToPlan(p.service)
          return (
            <AdminRow key={p.id} title={p.clientName} subtitle={`${p.clientEmail} · ${formatDate(p.createdAt)}`}
              badge={<View style={{ alignItems: 'flex-end', gap: 4 }}><T variant="num">{formatCurrency(p.amount)}</T><StatusPill status={p.status} /></View>}>
              <View style={{ width: '100%', gap: 8 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  <Badge label={p.service} tone="neutral" />
                  <Badge label={`Activates ${plan}`} tone={plan === 'PREMIUM' ? 'gold' : 'primary'} />
                  {p.paymentMethod ? <Badge label={p.paymentMethod} tone="neutral" icon="card-outline" /> : null}
                  {p.referralCode ? <Badge label={`Ref ${p.referralCode}`} tone="success" /> : null}
                </View>
                {p.paymentNote ? (
                  <View style={{ backgroundColor: c.card2, borderRadius: radius.sm, padding: 10 }}>
                    <T variant="overline">Transaction proof</T>
                    <T variant="small" color={c.ink} selectable style={{ marginTop: 2 }}>{p.paymentNote}</T>
                  </View>
                ) : null}
                {p.status === 'REJECTED' && p.rejectedNote ? <T variant="small" color={c.dangerText}>Reason: {p.rejectedNote}</T> : null}
                {p.status === 'PENDING' ? (
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button title="Confirm" icon="checkmark" size="sm" variant="success" style={{ flex: 1 }} onPress={() => confirm(p)} />
                    <Button title="Reject" size="sm" variant="dangerSoft" style={{ flex: 1 }} onPress={() => setRejecting(p)} />
                  </View>
                ) : null}
              </View>
            </AdminRow>
          )
        })
      )}

      <PromptModal
        visible={rejecting !== null}
        title={`Reject payment from ${rejecting?.clientName ?? ''}?`}
        label="Reason (optional)"
        placeholder="e.g. Transaction ID not found"
        confirmLabel="Reject"
        destructive
        onCancel={() => setRejecting(null)}
        onSubmit={(v) => { if (rejecting) setStatus(rejecting.id, 'REJECTED', v || undefined); setRejecting(null) }}
      />
    </Screen>
  )
}
