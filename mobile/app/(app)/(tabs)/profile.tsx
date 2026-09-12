import React, { useState } from 'react'
import { View, Platform, Alert, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import { useApi } from '@/api/hooks'
import { useAuth } from '@/auth/AuthContext'
import { apiFetch } from '@/api/client'
import { clearTokens } from '@/api/tokenStore'
import { Screen, T, Card, PlanBadge, Badge, Skeleton, ErrorState, Button, ListRow, Segmented, SectionTitle, Avatar, useTheme, spacing, radius, type IconName } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/format'
import { SUPPORT_EMAIL } from '@/lib/site'
import type { ThemePref } from '@/theme'

type ProfileBundle = {
  fullName: string
  email: string
  phone?: string | null
  country?: string | null
  username: string
  role: string
  plan: string
  studentId: string
  paymentMethod?: string | null
  createdAt: string
  totalEarned: number
  totalSales: number
  certificates: { id: string; issuedAt: string; course: { title: string; level: string } }[]
}

const LINKS: { href: string; label: string; sub: string; icon: IconName }[] = [
  { href: '/(app)/affiliate', label: 'Affiliate dashboard', sub: 'Referrals, commissions & payouts', icon: 'gift-outline' },
  { href: '/(app)/notifications', label: 'Notifications', sub: 'Account and payout alerts', icon: 'notifications-outline' },
  { href: '/(app)/watchlist', label: 'Markets', sub: 'Live prices', icon: 'trending-up-outline' },
  { href: '/(app)/calculator', label: 'Risk calculator', sub: 'Position-size tool', icon: 'calculator-outline' },
  { href: '/(app)/resources', label: 'Resources', sub: 'Guides & downloads', icon: 'folder-open-outline' },
  { href: '/(app)/brokers', label: 'Brokers', sub: 'Reviewed broker list', icon: 'business-outline' },
  { href: '/(app)/reviews', label: 'Leave a review', sub: 'Share your experience', icon: 'star-outline' },
]

export default function AccountScreen() {
  const router = useRouter()
  const { signOut } = useAuth()
  const { c, pref, setPref } = useTheme()
  const [deleting, setDeleting] = useState(false)
  const { data, isLoading, isError, refetch, isRefetching } = useApi<ProfileBundle>('/api/mobile/profile')

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This permanently deletes your account, course progress, certificates, posts, comments and affiliate records. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => Alert.alert('Are you absolutely sure?', 'Tap “Delete forever” to permanently delete your account.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete forever', style: 'destructive', onPress: deleteAccount },
          ]),
        },
      ]
    )
  }

  const deleteAccount = async () => {
    setDeleting(true)
    try {
      await apiFetch('/api/mobile/auth/delete-account', { method: 'DELETE' })
      await clearTokens()
      await signOut()
      Alert.alert('Account deleted', 'Your account and all associated data have been permanently deleted.')
    } catch (e) {
      Alert.alert('Could not delete account', e instanceof Error ? e.message : `Please contact ${SUPPORT_EMAIL}.`)
      setDeleting(false)
    }
  }

  if (isLoading) return <Screen edges={['top']} padded><Skeleton height={180} /><Skeleton height={90} /><Skeleton height={240} /></Screen>
  if (isError || !data) return <Screen edges={['top']}><ErrorState message="Couldn’t load your profile" onRetry={() => refetch()} /></Screen>

  const details: [string, string][] = [
    ['Email', data.email],
    ['Member ID', data.studentId],
    ['Phone', data.phone || '—'],
    ['Country', data.country || '—'],
    ['Payout method', data.paymentMethod || '—'],
    ['Member since', formatDate(data.createdAt)],
  ]

  return (
    <Screen edges={['top']} scroll refreshing={isRefetching} onRefresh={refetch}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <T variant="h1">Account</T>

        {/* Identity */}
        <Card style={{ marginTop: spacing.lg, alignItems: 'center', paddingVertical: spacing.xl }}>
          <Avatar name={data.fullName} size={72} />
          <T variant="h2" style={{ marginTop: 12, textAlign: 'center' }}>{data.fullName}</T>
          <T variant="small">@{data.username}</T>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
            <PlanBadge plan={data.plan} />
            <Badge label={data.role === 'AFFILIATE' ? 'Affiliate' : 'Member'} tone="neutral" />
          </View>
          <View style={{ flexDirection: 'row', alignSelf: 'stretch', marginTop: spacing.xl, borderTopWidth: 1, borderTopColor: c.border, paddingTop: spacing.lg }}>
            {[['Sales', String(data.totalSales)], ['Earned', formatCurrency(data.totalEarned)], ['Certificates', String(data.certificates.length)]].map(([l, v], i) => (
              <View key={l} style={{ flex: 1, alignItems: 'center', borderLeftWidth: i ? 1 : 0, borderLeftColor: c.border }}>
                <T variant="num" style={{ fontSize: 17 }}>{v}</T>
                <T variant="tiny">{l}</T>
              </View>
            ))}
          </View>
        </Card>

        {data.plan === 'FREE' && Platform.OS !== 'ios' ? (
          <Card style={{ marginTop: spacing.md, backgroundColor: c.goldTint, borderColor: c.goldLine }}>
            <T variant="bodyStrong">Unlock the full platform</T>
            <T variant="small" style={{ marginTop: 2, marginBottom: 12 }}>Premium research, courses and resources.</T>
            <Button title="View plans" variant="gold" icon="sparkles-outline" onPress={() => router.push('/(app)/order')} />
          </Card>
        ) : null}

        <SectionTitle>Shortcuts</SectionTitle>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {LINKS.map((l, i) => (
            <ListRow key={l.href} icon={l.icon} tone="primary" title={l.label} subtitle={l.sub} onPress={() => router.push(l.href as never)} last={i === LINKS.length - 1} />
          ))}
        </Card>

        <SectionTitle>Appearance</SectionTitle>
        <Segmented<ThemePref> value={pref} onChange={setPref} options={[{ key: 'system', label: 'System' }, { key: 'light', label: 'Light' }, { key: 'dark', label: 'Dark' }]} />

        <SectionTitle>Account details</SectionTitle>
        <Card style={{ paddingVertical: 4 }}>
          {details.map(([label, value], i) => (
            <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 11, borderTopWidth: i ? 1 : 0, borderTopColor: c.border }}>
              <T variant="small">{label}</T>
              <T variant="smallStrong" numberOfLines={1} style={{ flexShrink: 1, textAlign: 'right' }}>{value}</T>
            </View>
          ))}
        </Card>

        {data.certificates.length > 0 ? (
          <>
            <SectionTitle>Certificates</SectionTitle>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {data.certificates.map((cert, i) => (
                <ListRow key={cert.id} icon="ribbon-outline" tone="gold" title={cert.course.title} subtitle={`${cert.course.level} · ${formatDate(cert.issuedAt)}`} last={i === data.certificates.length - 1} right={<View />} />
              ))}
            </Card>
          </>
        ) : null}

        <SectionTitle>Support</SectionTitle>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <ListRow icon="mail-outline" title="Contact support" subtitle={SUPPORT_EMAIL} onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => {})} last />
        </Card>

        <Button title="Sign out" variant="secondary" icon="log-out-outline" style={{ marginTop: spacing.xl }} onPress={signOut} />

        <View style={{ marginTop: spacing.xl, padding: spacing.lg, borderWidth: 1, borderColor: c.dangerLine, backgroundColor: c.dangerTint, borderRadius: radius.lg }}>
          <T variant="bodyStrong" color={c.dangerText}>Danger zone</T>
          <T variant="small" style={{ marginTop: 4, marginBottom: 12 }}>Permanently delete your account and all associated data.</T>
          <Button title={deleting ? 'Deleting…' : 'Delete my account'} variant="danger" icon="trash-outline" onPress={confirmDeleteAccount} loading={deleting} />
        </View>
      </View>
    </Screen>
  )
}
