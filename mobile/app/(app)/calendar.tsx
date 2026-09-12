import React, { useState } from 'react'
import { View, ScrollView, Text } from 'react-native'
import { useApi } from '@/api/hooks'
import { Screen, Loader, ErrorState, EmptyState, T, Chip, SectionTitle, useTheme, spacing, radius, family } from '@/components/ui'
import type { EconomicEvent, Impact } from '@/types'

function dayKey(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

export default function CalendarScreen() {
  const { c } = useTheme()
  const { data, isLoading, isError, refetch, isRefetching } = useApi<EconomicEvent[]>('/api/calendar')
  const [impact, setImpact] = useState<Impact | 'ALL'>('ALL')
  const now = Date.now()
  const IMPACT: Record<Impact, string> = { HIGH: c.danger, MEDIUM: c.warning, LOW: c.success }

  const events = (data ?? [])
    .filter((e) => new Date(e.eventTime).getTime() >= now - 7 * 86400000)
    .filter((e) => impact === 'ALL' || e.impact === impact)
  const upcoming = events.filter((e) => new Date(e.eventTime).getTime() >= now)
  const past = events.filter((e) => new Date(e.eventTime).getTime() < now).reverse()

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError) return <Screen><ErrorState message="Couldn’t load the calendar" onRetry={() => refetch()} /></Screen>

  const renderGroup = (list: EconomicEvent[], isPast?: boolean) => {
    const groups = new Map<string, EconomicEvent[]>()
    list.forEach((e) => { const k = dayKey(new Date(e.eventTime)); groups.set(k, [...(groups.get(k) || []), e]) })
    return Array.from(groups.entries()).map(([day, items]) => (
      <View key={day} style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.md, opacity: isPast ? 0.85 : 1 }}>
        <View style={{ paddingHorizontal: spacing.lg, paddingVertical: 9, backgroundColor: c.card2, borderBottomWidth: 1, borderBottomColor: c.border }}>
          <T variant="smallStrong" color={c.muted}>{day}</T>
        </View>
        {items.map((e, i) => (
          <View key={e.id} style={{ flexDirection: 'row', gap: 12, padding: spacing.lg, borderTopWidth: i ? 1 : 0, borderTopColor: c.border }}>
            <View style={{ width: 4, borderRadius: 2, backgroundColor: IMPACT[e.impact] }} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontFamily: family.monoBold, fontSize: 13, color: c.ink }}>{new Date(e.eventTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</Text>
                <Text style={{ fontFamily: family.monoBold, fontSize: 12, color: c.primary }}>{e.currency}</Text>
                <Text style={{ fontFamily: family.bodyBold, fontSize: 10, color: IMPACT[e.impact], letterSpacing: 0.6 }}>{e.impact}</Text>
              </View>
              <T variant="bodyStrong" style={{ marginTop: 3 }}>{e.name}</T>
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 6 }}>
                {([['Actual', e.actual, c.successText], ['Forecast', e.forecast, c.text], ['Previous', e.previous, c.muted]] as [string, string | null | undefined, string][]).map(([l, v, col]) => (
                  <View key={l}>
                    <T variant="tiny">{l}</T>
                    <Text style={{ fontFamily: family.monoBold, fontSize: 13, color: v ? col : c.faint }}>{v || '—'}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
      </View>
    ))
  }

  return (
    <Screen scroll refreshing={isRefetching} onRefresh={refetch}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((k) => (
          <Chip key={k} label={k === 'ALL' ? 'All impact' : k.charAt(0) + k.slice(1).toLowerCase()} active={impact === k} onPress={() => setImpact(k)} />
        ))}
      </ScrollView>
      <View style={{ padding: spacing.lg }}>
        {events.length === 0 ? (
          <EmptyState icon="calendar-outline" title="No events to show" subtitle="Upcoming releases are added weekly." />
        ) : (
          <>
            {upcoming.length > 0 ? <><SectionTitle style={{ marginTop: 0 }}>Upcoming</SectionTitle>{renderGroup(upcoming)}</> : null}
            {past.length > 0 ? <><SectionTitle>Past 7 days</SectionTitle>{renderGroup(past, true)}</> : null}
          </>
        )}
      </View>
    </Screen>
  )
}
