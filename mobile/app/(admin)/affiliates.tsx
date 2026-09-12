import React from 'react'
import { View } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/hooks'
import { apiFetch } from '@/api/client'
import { Screen, Loader, ErrorState, EmptyState, StatusPill, Button, T, useTheme } from '@/components/ui'
import { AdminRow } from '@/components/AdminRow'
import { formatCurrency } from '@/lib/format'

type Affiliate = { id: string; fullName: string; email: string; username: string; referralCode: string | null; status: string; sales: number; earned: number }

export default function AdminAffiliatesScreen() {
  const qc = useQueryClient()
  const { c } = useTheme()
  const { data, isLoading, isError, refetch, isRefetching } = useApi<Affiliate[]>('/api/admin/affiliates')
  const list = data ?? []

  async function approve(a: Affiliate) {
    await apiFetch('/api/admin/users', { method: 'PATCH', body: { id: a.id, status: 'APPROVED', role: 'AFFILIATE' } }).catch(() => {})
    qc.invalidateQueries({ queryKey: ['/api/admin/affiliates'] })
    qc.invalidateQueries({ queryKey: ['/api/admin/users'] })
  }

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError) return <Screen><ErrorState message="Couldn’t load affiliates" onRetry={() => refetch()} /></Screen>

  return (
    <Screen scroll padded refreshing={isRefetching} onRefresh={refetch}>
      {list.length === 0 ? (
        <EmptyState icon="git-branch-outline" title="No affiliates yet" />
      ) : (
        list.map((a) => (
          <AdminRow key={a.id} title={a.fullName} subtitle={`@${a.username} · ${a.email}${a.referralCode ? `\nRef ${a.referralCode}` : ''}`} badge={<StatusPill status={a.status} />}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View><T variant="tiny">Sales</T><T variant="num">{a.sales}</T></View>
                <View><T variant="tiny">Earned</T><T variant="num" color={c.successText}>{formatCurrency(a.earned)}</T></View>
              </View>
              {a.status === 'PENDING' ? <Button title="Approve" size="sm" variant="successSoft" icon="checkmark" block={false} onPress={() => approve(a)} /> : null}
            </View>
          </AdminRow>
        ))
      )}
    </Screen>
  )
}
