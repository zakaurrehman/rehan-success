import React from 'react'
import { View, Pressable, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/auth/AuthContext'
import { useApi } from '@/api/hooks'
import { Screen, T, Button, Logo, SectionTitle, useTheme, spacing, radius, family, type IconName } from '@/components/ui'

type Tile = { label: string; icon: IconName; href: string; desc: string; count?: number }

export default function AdminDashboard() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { c } = useTheme()
  const payments = useApi<{ status: string }[]>('/api/admin/payments')
  const withdrawals = useApi<{ status: string }[]>('/api/admin/withdrawals')
  const reviews = useApi<{ status: string }[]>('/api/reviews?all=1')
  const affiliates = useApi<{ status: string }[]>('/api/admin/affiliates')
  const pending = (q: { data?: { status: string }[] }) => (q.data ?? []).filter((x) => x.status === 'PENDING').length

  const queue: Tile[] = [
    { label: 'Payments', icon: 'card-outline', href: '/(admin)/payments', desc: 'Confirm orders', count: pending(payments) },
    { label: 'Withdrawals', icon: 'wallet-outline', href: '/(admin)/withdrawals', desc: 'Pay out requests', count: pending(withdrawals) },
    { label: 'Affiliates', icon: 'git-branch-outline', href: '/(admin)/affiliates', desc: 'Applications', count: pending(affiliates) },
    { label: 'Reviews', icon: 'star-outline', href: '/(admin)/reviews', desc: 'Moderation', count: pending(reviews) },
  ]
  const content: Tile[] = [
    { label: 'Signals', icon: 'flash-outline', href: '/(admin)/signals', desc: 'Publish & close' },
    { label: 'Research', icon: 'document-text-outline', href: '/(admin)/research', desc: 'Posts & gating' },
    { label: 'Courses', icon: 'school-outline', href: '/(admin)/courses', desc: 'Courses & videos' },
    { label: 'Live', icon: 'radio-outline', href: '/(admin)/sessions', desc: 'Sessions' },
    { label: 'Calendar', icon: 'calendar-outline', href: '/(admin)/calendar', desc: 'Economic events' },
    { label: 'Brokers', icon: 'business-outline', href: '/(admin)/brokers', desc: 'Recommendations' },
    { label: 'Resources', icon: 'folder-open-outline', href: '/(admin)/resources', desc: 'Downloads' },
    { label: 'Users', icon: 'people-outline', href: '/(admin)/users', desc: 'Approve & plans' },
    { label: 'Sales', icon: 'cash-outline', href: '/(admin)/sales', desc: 'Record a sale' },
  ]

  const onRefresh = () => { payments.refetch(); withdrawals.refetch(); reviews.refetch(); affiliates.refetch() }
  const totalPending = queue.reduce((s, t) => s + (t.count ?? 0), 0)

  return (
    <Screen edges={['top']} scroll refreshing={payments.isRefetching} onRefresh={onRefresh}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo size={30} />
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: c.card3 }}>
            <Text style={{ fontFamily: family.bodyBold, fontSize: 11, color: c.muted }}>ADMIN</Text>
          </View>
        </View>
        <T variant="h1" style={{ marginTop: spacing.xl }}>Hi, {user?.fullName?.split(' ')[0] ?? 'Admin'}</T>
        <T variant="small">{totalPending ? `${totalPending} item${totalPending === 1 ? '' : 's'} need your attention` : 'Everything is up to date'}</T>

        <SectionTitle>Needs attention</SectionTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {queue.map((t) => (
            <Pressable key={t.href} onPress={() => router.push(t.href as never)} accessibilityRole="button" accessibilityLabel={`${t.label}, ${t.count ?? 0} pending`}
              style={({ pressed }) => ({ width: '48.5%', backgroundColor: c.card, borderWidth: 1, borderColor: t.count ? c.warningLine : c.border, borderRadius: radius.lg, padding: 14, opacity: pressed ? 0.85 : 1 })}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Ionicons name={t.icon} size={20} color={t.count ? c.warningText : c.dim} />
                <Text style={{ fontFamily: family.monoBold, fontSize: 20, color: t.count ? c.warningText : c.faint }}>{t.count ?? 0}</Text>
              </View>
              <T variant="bodyStrong" style={{ marginTop: 10 }}>{t.label}</T>
              <T variant="tiny">{t.desc}</T>
            </Pressable>
          ))}
        </View>

        <SectionTitle>Manage</SectionTitle>
        <View style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: radius.lg, overflow: 'hidden' }}>
          {content.map((t, i) => (
            <Pressable key={t.href} onPress={() => router.push(t.href as never)} accessibilityRole="button"
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderTopWidth: i ? 1 : 0, borderTopColor: c.border, backgroundColor: pressed ? c.card2 : 'transparent' })}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.primaryTint, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={t.icon} size={18} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <T variant="bodyStrong">{t.label}</T>
                <T variant="tiny">{t.desc}</T>
              </View>
              <Ionicons name="chevron-forward" size={18} color={c.faint} />
            </Pressable>
          ))}
        </View>

        <Button title="Sign out" variant="secondary" icon="log-out-outline" style={{ marginTop: spacing.xl }} onPress={signOut} />
      </View>
    </Screen>
  )
}
