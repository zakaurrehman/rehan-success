import React from 'react'
import { View } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useApi } from '@/api/hooks'
import { useAuth } from '@/auth/AuthContext'
import { IS_IOS_FREE_ONLY, canAccessResource } from '@/lib/gating'
import { Screen, Loader, ErrorState, EmptyState, T, Badge, Button, SectionTitle, useTheme, spacing, radius, type Tone } from '@/components/ui'
import type { Plan, Resource } from '@/types'

const TIER_TONE: Record<string, Tone> = { FREE: 'success', BASIC: 'primary', PREMIUM: 'gold' }

export default function ResourcesScreen() {
  const { user } = useAuth()
  const { c } = useTheme()
  const router = useRouter()
  const plan = (user?.plan ?? 'FREE') as Plan
  const { data, isLoading, isError, refetch, isRefetching } = useApi<Resource[]>('/api/resources')
  // iOS: only FREE tier resources are shown (App Store IAP rule)
  const resources = (data ?? []).filter((r) => !IS_IOS_FREE_ONLY || r.tier === 'FREE')
  const categories = Array.from(new Set(resources.map((r) => r.category)))

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError) return <Screen><ErrorState message="Couldn’t load resources" onRetry={() => refetch()} /></Screen>

  return (
    <Screen scroll padded refreshing={isRefetching} onRefresh={refetch}>
      {resources.length === 0 ? (
        <EmptyState icon="folder-open-outline" title="Resources coming soon" />
      ) : (
        categories.map((cat, ci) => (
          <View key={cat}>
            <SectionTitle style={ci === 0 ? { marginTop: 0 } : undefined}>{cat}</SectionTitle>
            {resources.filter((r) => r.category === cat).map((r) => {
              const locked = !canAccessResource(r.tier, plan) || !r.fileUrl
              return (
                <View key={r.id} style={{ flexDirection: 'row', gap: 12, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: radius.lg, padding: 14, marginBottom: 10 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: locked ? c.card2 : c.primaryTint, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={locked ? 'lock-closed' : 'document-text'} size={20} color={locked ? c.dim : c.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                      <T variant="bodyStrong" style={{ flex: 1 }}>{r.title}</T>
                      <Badge label={r.tier} tone={TIER_TONE[r.tier] ?? 'neutral'} />
                    </View>
                    <T variant="small" numberOfLines={2} style={{ marginTop: 2 }}>{r.description}</T>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                      <T variant="tiny">{r.downloads} downloads</T>
                      {locked ? (
                        IS_IOS_FREE_ONLY ? null : <Button title="Upgrade" size="sm" variant="secondary" block={false} onPress={() => router.push('/(app)/order')} />
                      ) : (
                        <Button title="Download" size="sm" icon="download-outline" block={false} onPress={() => WebBrowser.openBrowserAsync(r.fileUrl)} />
                      )}
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        ))
      )}
    </Screen>
  )
}
