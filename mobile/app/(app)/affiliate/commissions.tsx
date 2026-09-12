import React from 'react'
import { View } from 'react-native'
import { useApi } from '@/api/hooks'
import { Screen, Loader, ErrorState, EmptyState, Card, T, Badge, useTheme, spacing } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/format'

type CommissionRow = { id: string; amount: number; withdrawn: boolean; createdAt: string; sale: { clientName: string; amount: number } }

export default function CommissionsScreen() {
  const { c } = useTheme()
  const { data, isLoading, isError, refetch, isRefetching } = useApi<CommissionRow[]>('/api/mobile/affiliate/commissions')
  const items = data ?? []
  const total = items.reduce((s, x) => s + x.amount, 0)

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError) return <Screen><ErrorState message="Couldn’t load commissions" onRetry={() => refetch()} /></Screen>

  return (
    <Screen scroll padded refreshing={isRefetching} onRefresh={refetch}>
      {items.length === 0 ? (
        <EmptyState icon="cash-outline" title="No commissions yet" subtitle="Share your referral link to start earning 50% on every sale." />
      ) : (
        <>
          <T variant="small" style={{ marginBottom: spacing.md }}>{items.length} record{items.length === 1 ? '' : 's'} · <T variant="smallStrong">{formatCurrency(total)}</T> total</T>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {items.map((x, i) => (
              <View key={x.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.lg, borderTopWidth: i ? 1 : 0, borderTopColor: c.border }}>
                <View style={{ flex: 1 }}>
                  <T variant="bodyStrong" numberOfLines={1}>{x.sale.clientName}</T>
                  <T variant="tiny">{formatDate(x.createdAt)} · Sale {formatCurrency(x.sale.amount)}</T>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <T variant="num" color={c.successText}>{formatCurrency(x.amount)}</T>
                  <Badge label={x.withdrawn ? 'Paid out' : 'Available'} tone={x.withdrawn ? 'neutral' : 'success'} />
                </View>
              </View>
            ))}
          </Card>
        </>
      )}
    </Screen>
  )
}
