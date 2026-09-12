import React, { useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useApi } from '@/api/hooks'
import { useAuth } from '@/auth/AuthContext'
import SignalCard from '@/components/SignalCard'
import { Screen, T, IconButton, Chip, Skeleton, ErrorState, EmptyState, SectionTitle, TextLink, Button, useTheme, spacing, radius, family, type IconName } from '@/components/ui'
import type { AppNotification, Signal, SignalStat } from '@/types'

type StatsResp = { current: SignalStat | null; months: SignalStat[] }

const TOOLS: { label: string; icon: IconName; href: string }[] = [
  { label: 'History', icon: 'time-outline', href: '/(app)/signals-history' },
  { label: 'Markets', icon: 'trending-up-outline', href: '/(app)/watchlist' },
  { label: 'Calendar', icon: 'calendar-outline', href: '/(app)/calendar' },
  { label: 'Calculator', icon: 'calculator-outline', href: '/(app)/calculator' },
  { label: 'Live', icon: 'radio-outline', href: '/(app)/live' },
  { label: 'Brokers', icon: 'business-outline', href: '/(app)/brokers' },
  { label: 'Resources', icon: 'folder-open-outline', href: '/(app)/resources' },
  { label: 'Affiliate', icon: 'gift-outline', href: '/(app)/affiliate' },
]

export default function SignalDeskScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { c, shadow } = useTheme()
  const signals = useApi<Signal[]>('/api/signals')
  const stats = useApi<StatsResp>('/api/signals?stats=1')
  const notes = useApi<AppNotification[]>('/api/notifications')
  const [dir, setDir] = useState<'ALL' | 'BUY' | 'SELL'>('ALL')

  const list = signals.data ?? []
  const shown = list.filter((s) => dir === 'ALL' || s.direction === dir)
  const cur = stats.data?.current
  const unread = (notes.data ?? []).filter((n) => !n.read).length
  const firstName = (user?.fullName || 'Trader').split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const onRefresh = () => { signals.refetch(); stats.refetch(); notes.refetch() }

  return (
    <Screen edges={['top']} scroll refreshing={signals.isRefetching} onRefresh={onRefresh}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: 12 }}>
        <View style={{ flex: 1 }}>
          <T variant="small">{greeting},</T>
          <T variant="h1">{firstName}</T>
        </View>
        <IconButton icon="notifications-outline" label={`Notifications${unread ? `, ${unread} unread` : ''}`} badge={unread} onPress={() => router.push('/(app)/notifications')} />
      </View>

      {/* Performance hero */}
      <View style={[{ marginHorizontal: spacing.lg, marginTop: spacing.lg, borderRadius: radius.xxl, backgroundColor: '#0b3f3b', padding: spacing.xl, overflow: 'hidden' }, shadow.md]}>
        <View style={{ position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(45,212,191,0.16)', top: -90, right: -70 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: family.bodyMedium, fontSize: 13 }}>Signal performance{cur ? ` · ${cur.month}` : ''}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' }} />
            <Text style={{ color: '#fff', fontFamily: family.bodyBold, fontSize: 11 }}>{list.length} open</Text>
          </View>
        </View>
        {stats.isLoading ? (
          <View style={{ height: 96 }} />
        ) : cur ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 10 }}>
              <Text style={{ color: '#fff', fontFamily: family.monoBold, fontSize: 44, letterSpacing: -1.5 }}>{cur.winRate}%</Text>
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontFamily: family.body, fontSize: 13, marginBottom: 10 }}>win rate</Text>
            </View>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden', marginTop: 4 }}>
              <View style={{ width: `${Math.min(100, cur.winRate)}%`, height: 6, backgroundColor: '#5eead4' }} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
              {[['Pips gained', `+${cur.pipsGained}`], ['Pips lost', `-${cur.pipsLost}`], ['Signals', String(cur.totalSignals)]].map(([l, v]) => (
                <View key={l} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.md, paddingVertical: 9, paddingHorizontal: 10 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontFamily: family.body, fontSize: 11 }}>{l}</Text>
                  <Text style={{ color: '#fff', fontFamily: family.monoBold, fontSize: 15, marginTop: 2 }}>{v}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontFamily: family.body, fontSize: 14, marginTop: 12 }}>Monthly performance appears here once results are published.</Text>
        )}
      </View>

      {/* Tools */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg - 4, marginTop: spacing.lg }}>
        {TOOLS.map((t) => (
          <Pressable key={t.label} onPress={() => router.push(t.href as never)} accessibilityRole="button" accessibilityLabel={t.label}
            style={({ pressed }) => ({ width: '25%', alignItems: 'center', paddingVertical: 10, opacity: pressed ? 0.7 : 1 })}>
            <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={t.icon} size={22} color={c.primary} />
            </View>
            <Text style={{ marginTop: 6, fontFamily: family.bodyMedium, fontSize: 12, color: c.text }}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Signals */}
      <View style={{ paddingHorizontal: spacing.lg }}>
        <SectionTitle action={<TextLink title="History" icon="chevron-forward" onPress={() => router.push('/(app)/signals-history')} />}>Open signals</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: spacing.md }}>
          {(['ALL', 'BUY', 'SELL'] as const).map((d) => (
            <Chip key={d} label={d === 'ALL' ? `All (${list.length})` : d === 'BUY' ? 'Buy' : 'Sell'} active={dir === d} onPress={() => setDir(d)} />
          ))}
        </ScrollView>
        {signals.isLoading ? (
          <><Skeleton height={150} /><Skeleton height={150} /></>
        ) : signals.isError ? (
          <ErrorState message="Couldn’t load signals" onRetry={() => signals.refetch()} />
        ) : shown.length === 0 ? (
          <EmptyState icon="hourglass-outline" title={list.length ? 'No signals match this filter' : 'No open signals right now'} subtitle="You’ll get a notification the moment a new setup is published."
            action={<Button title="View signal history" variant="secondary" onPress={() => router.push('/(app)/signals-history')} />} />
        ) : (
          shown.map((sig) => <SignalCard key={sig.id} signal={sig} />)
        )}
        <T variant="tiny" style={{ marginTop: spacing.sm, lineHeight: 16 }}>Signals are educational trade ideas. Always use a stop loss and size positions responsibly.</T>
      </View>
    </Screen>
  )
}
