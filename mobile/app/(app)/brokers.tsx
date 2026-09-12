import React from 'react'
import { View, Text } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { Ionicons } from '@expo/vector-icons'
import { useApi } from '@/api/hooks'
import { Screen, Loader, ErrorState, EmptyState, Card, T, Badge, Button, Notice, useTheme, spacing, family } from '@/components/ui'
import type { Broker } from '@/types'

export default function BrokersScreen() {
  const { c } = useTheme()
  const { data, isLoading, isError, refetch, isRefetching } = useApi<Broker[]>('/api/brokers')
  const brokers = data ?? []

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError) return <Screen><ErrorState message="Couldn’t load brokers" onRetry={() => refetch()} /></Screen>

  return (
    <Screen scroll padded refreshing={isRefetching} onRefresh={refetch}>
      <Notice tone="warning" icon="information-circle-outline" message="Some links are affiliate links. Always do your own research — trading involves risk." />
      <View style={{ height: spacing.lg }} />
      {brokers.length === 0 ? (
        <EmptyState icon="business-outline" title="Broker recommendations coming soon" />
      ) : (
        brokers.map((b) => (
          <Card key={b.id} style={{ marginBottom: spacing.md, borderColor: b.isRecommended ? c.goldLine : c.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: c.card2, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: family.displayHeavy, fontSize: 20, color: c.ink }}>{b.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <T variant="h3">{b.name}</T>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Ionicons name="star" size={12} color={c.gold} />
                  <T variant="tiny" color={c.text}>{b.rating.toFixed(1)}</T>
                </View>
              </View>
              {b.isRecommended ? <Badge label="Our pick" tone="gold" icon="ribbon-outline" /> : null}
            </View>
            <T variant="small" style={{ marginTop: 12 }}>{b.description}</T>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              {b.minDeposit ? <Badge label={`Min ${b.minDeposit}`} tone="neutral" /> : null}
              {b.regulation ? <Badge label={b.regulation} tone="success" icon="shield-checkmark-outline" /> : null}
            </View>
            <Button title="Open account" iconRight="open-outline" style={{ marginTop: spacing.lg }} onPress={() => WebBrowser.openBrowserAsync(b.link)} />
          </Card>
        ))
      )}
    </Screen>
  )
}
