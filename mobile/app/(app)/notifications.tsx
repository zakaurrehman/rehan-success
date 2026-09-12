import React, { useState } from 'react'
import { View, Pressable } from 'react-native'
import { useRouter, useNavigation } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/hooks'
import { apiFetch } from '@/api/client'
import { Screen, Loader, ErrorState, EmptyState, T, TextLink, useTheme, spacing, radius, type IconName } from '@/components/ui'
import { timeAgo } from '@/lib/format'
import type { AppNotification } from '@/types'

function iconFor(n: AppNotification): IconName {
  const t = `${n.title} ${n.link ?? ''}`.toLowerCase()
  if (t.includes('withdraw')) return 'wallet-outline'
  if (t.includes('commission')) return 'cash-outline'
  if (t.includes('signal')) return 'flash-outline'
  if (t.includes('live')) return 'radio-outline'
  return 'notifications-outline'
}

export default function NotificationsScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const qc = useQueryClient()
  const { c } = useTheme()
  const { data, isLoading, isError, refetch, isRefetching } = useApi<AppNotification[]>('/api/notifications')
  const [marking, setMarking] = useState(false)
  const items = data ?? []
  const unread = items.filter((n) => !n.read).length

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: unread ? () => <TextLink title={marking ? 'Marking…' : 'Mark all read'} onPress={markAll} /> : undefined,
    })
  })

  async function markAll() {
    if (marking) return
    setMarking(true)
    await Promise.all(items.filter((n) => !n.read).map((n) => apiFetch('/api/notifications', { method: 'PATCH', body: { id: n.id } }).catch(() => {})))
    await qc.invalidateQueries({ queryKey: ['/api/notifications'] })
    setMarking(false)
  }

  async function open(n: AppNotification) {
    if (!n.read) {
      qc.setQueryData<AppNotification[]>(['/api/notifications'], (prev) => prev?.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
      apiFetch('/api/notifications', { method: 'PATCH', body: { id: n.id } }).catch(() => {})
    }
    if (n.link) {
      const path = n.link.startsWith('/(') ? n.link : `/(app)${n.link}`
      router.push(path as never)
    }
  }

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError) return <Screen><ErrorState message="Couldn’t load notifications" onRetry={() => refetch()} /></Screen>

  return (
    <Screen scroll padded refreshing={isRefetching} onRefresh={refetch}>
      <T variant="small" style={{ marginBottom: spacing.md }}>{unread ? `${unread} unread` : 'You’re all caught up'}</T>
      {items.length === 0 ? (
        <EmptyState icon="notifications-outline" title="No notifications yet" subtitle="Commission, payout and account updates appear here." />
      ) : (
        <View style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: radius.lg, overflow: 'hidden' }}>
          {items.map((n, i) => (
            <Pressable key={n.id} onPress={() => open(n)} accessibilityRole="button" accessibilityLabel={`${n.read ? '' : 'Unread. '}${n.title}. ${n.message}`}
              style={({ pressed }) => ({ flexDirection: 'row', gap: 12, padding: 14, borderTopWidth: i ? 1 : 0, borderTopColor: c.border, backgroundColor: pressed ? c.card2 : n.read ? 'transparent' : c.primaryTint })}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: n.read ? c.card2 : c.card, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={iconFor(n)} size={19} color={n.read ? c.dim : c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <T variant={n.read ? 'small' : 'smallStrong'} color={c.ink} style={{ flex: 1 }} numberOfLines={1}>{n.title}</T>
                  <T variant="tiny">{timeAgo(n.createdAt)}</T>
                </View>
                <T variant="small" style={{ marginTop: 2 }}>{n.message}</T>
              </View>
              {!n.read ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.primary, marginTop: 6 }} /> : null}
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  )
}
