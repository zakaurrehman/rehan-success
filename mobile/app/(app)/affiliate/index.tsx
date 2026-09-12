import React, { useState } from 'react'
import { View, Share, Text } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { useRouter } from 'expo-router'
import { useApi } from '@/api/hooks'
import { Screen, Loader, ErrorState, Card, T, Button, StatTile, SectionTitle, StatusPill, EmptyState, Notice, ListRow, useTheme, spacing, radius, family } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/format'

type Bundle = {
  referralCode: string | null
  referralLink: string | null
  totalEarned: number
  available: number
  withdrawn: number
  totalSales: number
  commissionsCount: number
  salesRecent: { id: string; clientName: string; amount: number; createdAt: string }[]
  withdrawalsRecent: { id: string; amount: number; status: string; createdAt: string }[]
}

export default function AffiliateDashboard() {
  const router = useRouter()
  const { c, shadow } = useTheme()
  const [copied, setCopied] = useState(false)
  const { data, isLoading, isError, refetch, isRefetching } = useApi<Bundle>('/api/mobile/affiliate')

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError || !data) return <Screen><ErrorState message="Couldn’t load your dashboard" onRetry={() => refetch()} /></Screen>

  async function copy() {
    if (!data?.referralLink) return
    await Clipboard.setStringAsync(data.referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <Screen scroll padded refreshing={isRefetching} onRefresh={refetch}>
      {/* Balance hero */}
      <View style={[{ backgroundColor: '#0b3f3b', borderRadius: 24, padding: spacing.xl, overflow: 'hidden' }, shadow.md]}>
        <View style={{ position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(227,192,99,0.16)', top: -80, right: -60 }} />
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: family.bodyMedium, fontSize: 13 }}>Available to withdraw</Text>
        <Text style={{ color: '#fff', fontFamily: family.monoBold, fontSize: 38, letterSpacing: -1.2, marginTop: 4 }}>{formatCurrency(data.available)}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontFamily: family.body, fontSize: 12, marginTop: 2 }}>50% commission on every referred sale</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.lg }}>
          <Button title="Withdraw" icon="wallet-outline" variant="gold" style={{ flex: 1 }} onPress={() => router.push('/(app)/affiliate/withdraw')} disabled={data.available <= 0} />
          <Button title="Commissions" variant="secondary" style={{ flex: 1 }} onPress={() => router.push('/(app)/affiliate/commissions')} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.md }}>
        <StatTile label="Total earned" value={formatCurrency(data.totalEarned)} tone="primary" icon="trending-up-outline" />
        <StatTile label="Withdrawn" value={formatCurrency(data.withdrawn)} icon="checkmark-done-outline" />
        <StatTile label="Records" value={String(data.commissionsCount)} icon="receipt-outline" />
      </View>

      <SectionTitle>Your referral link</SectionTitle>
      {data.referralLink ? (
        <Card>
          <View style={{ backgroundColor: c.card2, borderWidth: 1, borderColor: c.border, borderRadius: radius.md, padding: 12 }}>
            <Text style={{ fontFamily: family.mono, fontSize: 12, color: c.text }} selectable numberOfLines={2}>{data.referralLink}</Text>
          </View>
          <T variant="tiny" style={{ marginTop: 8 }}>Code: <T variant="tiny" color={c.ink}>{data.referralCode}</T> — buyers can also enter it at checkout.</T>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.md }}>
            <Button title={copied ? 'Copied!' : 'Copy link'} icon={copied ? 'checkmark' : 'copy-outline'} variant={copied ? 'successSoft' : 'primary'} style={{ flex: 1 }} onPress={copy} />
            <Button title="Share" icon="share-social-outline" variant="secondary" style={{ flex: 1 }} onPress={() => Share.share({ message: `Join Rehan Success with my link: ${data.referralLink}` })} />
          </View>
        </Card>
      ) : (
        <Notice tone="warning" icon="time-outline" message="Your referral link is activated once your account is approved." />
      )}

      <SectionTitle>Recent sales</SectionTitle>
      {data.salesRecent.length ? (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {data.salesRecent.map((s, i) => (
            <ListRow key={s.id} icon="person-outline" tone="success" title={s.clientName} subtitle={`${formatDate(s.createdAt)} · Sale ${formatCurrency(s.amount)}`} last={i === data.salesRecent.length - 1}
              right={<T variant="num" color={c.successText} style={{ fontSize: 14 }}>+{formatCurrency(s.amount * 0.5)}</T>} />
          ))}
        </Card>
      ) : (
        <EmptyState icon="people-outline" title="No sales yet" subtitle="Share your link to start earning." />
      )}

      <SectionTitle>Recent withdrawals</SectionTitle>
      {data.withdrawalsRecent.length ? (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {data.withdrawalsRecent.map((w, i) => (
            <ListRow key={w.id} icon="wallet-outline" title={formatCurrency(w.amount)} subtitle={formatDate(w.createdAt)} last={i === data.withdrawalsRecent.length - 1} right={<StatusPill status={w.status} />} />
          ))}
        </Card>
      ) : (
        <T variant="small">No withdrawal requests yet.</T>
      )}
    </Screen>
  )
}
