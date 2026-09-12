import React from 'react'
import { View, Text } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { Ionicons } from '@expo/vector-icons'
import { useApi } from '@/api/hooks'
import { Screen, Loader, ErrorState, EmptyState, Card, T, Badge, Button, SectionTitle, useTheme, spacing, radius, family } from '@/components/ui'
import { formatDateTime } from '@/lib/format'
import type { LiveSession } from '@/types'

export default function LiveScreen() {
  const { c } = useTheme()
  const { data, isLoading, isError, refetch, isRefetching } = useApi<LiveSession[]>('/api/live')
  const now = Date.now()
  const sessions = data ?? []
  const live = sessions.filter((s) => s.isLive)
  const upcoming = sessions
    .filter((s) => !s.isLive && new Date(s.scheduledAt).getTime() >= now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 10)

  function countdown(at: string) {
    const diff = new Date(at).getTime() - now
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    const mins = Math.floor((diff % 3600000) / 60000)
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError) return <Screen><ErrorState message="Couldn’t load sessions" onRetry={() => refetch()} /></Screen>

  return (
    <Screen scroll padded refreshing={isRefetching} onRefresh={refetch}>
      {live.map((s) => (
        <View key={s.id} style={{ backgroundColor: c.dangerTint, borderWidth: 1, borderColor: c.dangerLine, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md }}>
          <Badge label="LIVE NOW" tone="danger" solid icon="radio" />
          <T variant="h2" style={{ marginTop: 10 }}>{s.title}</T>
          {s.description ? <T variant="small" color={c.text} style={{ marginTop: 4 }}>{s.description}</T> : null}
          {s.streamUrl ? (
            <Button title="Join the stream" variant="danger" icon="play" style={{ marginTop: spacing.md }} onPress={() => WebBrowser.openBrowserAsync(s.streamUrl as string)} />
          ) : (
            <T variant="small" style={{ marginTop: 8 }}>Stream link will be shared shortly.</T>
          )}
        </View>
      ))}
      {live.length === 0 ? (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.card2, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="radio-outline" size={22} color={c.dim} />
          </View>
          <View style={{ flex: 1 }}>
            <T variant="bodyStrong">No live session right now</T>
            <T variant="small">You’ll get a notification when a session starts.</T>
          </View>
        </Card>
      ) : null}

      <SectionTitle>Upcoming</SectionTitle>
      {upcoming.length === 0 ? (
        <EmptyState icon="calendar-outline" title="No sessions scheduled" />
      ) : (
        upcoming.map((s) => {
          const d = new Date(s.scheduledAt)
          return (
            <Card key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.md }}>
              <View style={{ width: 54, borderRadius: 14, paddingVertical: 8, alignItems: 'center', backgroundColor: c.primaryTint }}>
                <Text style={{ fontFamily: family.bodyBold, fontSize: 11, color: c.primary, textTransform: 'uppercase' }}>{d.toLocaleString('en-US', { month: 'short' })}</Text>
                <Text style={{ fontFamily: family.monoBold, fontSize: 20, color: c.ink }}>{d.getDate()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <T variant="bodyStrong" numberOfLines={2}>{s.title}</T>
                <T variant="tiny">{formatDateTime(s.scheduledAt)}</T>
              </View>
              <Badge label={`in ${countdown(s.scheduledAt)}`} tone="primary" />
            </Card>
          )
        })
      )}
    </Screen>
  )
}
