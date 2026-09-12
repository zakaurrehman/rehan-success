import React, { useState } from 'react'
import { View, ScrollView } from 'react-native'
import { useApi } from '@/api/hooks'
import SignalCard from '@/components/SignalCard'
import { Screen, Loader, ErrorState, EmptyState, Card, T, Chip, SectionTitle, ProgressBar, StatTile, useTheme, spacing } from '@/components/ui'
import type { Signal, SignalStat } from '@/types'

type StatsResp = { current: SignalStat | null; months: SignalStat[] }
type Filter = 'ALL' | 'HIT_TP' | 'HIT_SL' | 'CLOSED'

export default function SignalHistoryScreen() {
  const { c } = useTheme()
  const closedQ = useApi<Signal[]>('/api/signals?history=1')
  const statsQ = useApi<StatsResp>('/api/signals?stats=1')
  const [filter, setFilter] = useState<Filter>('ALL')

  if (closedQ.isLoading) return <Screen><Loader /></Screen>
  if (closedQ.isError) return <Screen><ErrorState message="Couldn’t load history" onRetry={() => closedQ.refetch()} /></Screen>

  const closed = closedQ.data ?? []
  const tp = closed.filter((s) => s.status === 'HIT_TP').length
  const sl = closed.filter((s) => s.status === 'HIT_SL').length
  const wr = closed.length > 0 ? Math.round((tp / closed.length) * 100) : 0
  const months = statsQ.data?.months ?? []
  const shown = filter === 'ALL' ? closed : closed.filter((s) => s.status === filter)

  return (
    <Screen scroll padded refreshing={closedQ.isRefetching} onRefresh={() => { closedQ.refetch(); statsQ.refetch() }}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <StatTile label="Win rate" value={`${wr}%`} tone="primary" icon="analytics-outline" />
        <StatTile label="TP hits" value={String(tp)} tone="success" icon="checkmark-circle-outline" />
        <StatTile label="SL hits" value={String(sl)} tone="danger" icon="close-circle-outline" />
      </View>

      {months.length > 0 ? (
        <>
          <SectionTitle>Monthly results</SectionTitle>
          <Card style={{ paddingVertical: 6 }}>
            {months.map((m, i) => (
              <View key={m.id} style={{ paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: c.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <T variant="bodyStrong">{m.month}</T>
                    <T variant="tiny">{m.totalSignals} signals · <T variant="tiny" color={c.successText}>+{m.pipsGained}</T> / <T variant="tiny" color={c.dangerText}>-{m.pipsLost}</T> pips</T>
                  </View>
                  <T variant="num" color={c.primary}>{m.winRate}%</T>
                </View>
                <View style={{ marginTop: 8 }}><ProgressBar value={m.winRate} height={5} /></View>
              </View>
            ))}
          </Card>
        </>
      ) : null}

      <SectionTitle>Closed signals</SectionTitle>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: spacing.md }}>
        {([['ALL', 'All'], ['HIT_TP', 'TP hit'], ['HIT_SL', 'SL hit'], ['CLOSED', 'Closed']] as [Filter, string][]).map(([k, l]) => (
          <Chip key={k} label={l} active={filter === k} onPress={() => setFilter(k)} />
        ))}
      </ScrollView>
      {shown.length === 0 ? (
        <EmptyState icon="time-outline" title="No closed signals yet" subtitle="Signals appear here once they hit a target, stop or are closed." />
      ) : (
        shown.map((s) => <SignalCard key={s.id} signal={s} />)
      )}
    </Screen>
  )
}
