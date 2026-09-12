import React from 'react'
import { View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { useApi } from '@/api/hooks'
import { useAuth } from '@/auth/AuthContext'
import { IS_IOS_FREE_ONLY, isLocked } from '@/lib/gating'
import { Screen, Loader, ErrorState, EmptyState, Badge, Avatar, T, Button, RiskDisclaimer, useTheme, spacing } from '@/components/ui'
import { formatDateTime } from '@/lib/format'
import type { Plan, ResearchPost } from '@/types'

export default function ResearchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { c } = useTheme()
  const { data, isLoading, isError, refetch } = useApi<ResearchPost[]>('/api/research')

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError) return <Screen><ErrorState message="Couldn’t load this post" onRetry={() => refetch()} /></Screen>

  const post = (data ?? []).find((p) => p.id === id)
  if (!post) return <Screen padded><EmptyState icon="document-text-outline" title="Post not found" subtitle="It may have been removed." /></Screen>

  // iOS: premium content is not available (App Store IAP rule).
  if (IS_IOS_FREE_ONLY && post.isPremium) {
    return <Screen padded><EmptyState icon="lock-closed-outline" title="Not available in the app" subtitle="This article isn’t available on iOS." /></Screen>
  }
  if (isLocked(post.isPremium, (user?.plan ?? 'FREE') as Plan)) {
    return (
      <Screen padded>
        <EmptyState icon="lock-closed-outline" title="Premium analysis" subtitle="Upgrade to the Premium plan to read this post."
          action={<Button title="View plans" variant="gold" onPress={() => router.replace('/(app)/order')} />} />
      </Screen>
    )
  }

  return (
    <Screen scroll>
      {post.imageUrl ? <Image source={{ uri: post.imageUrl }} style={{ width: '100%', height: 220, backgroundColor: c.card3 }} contentFit="cover" transition={200} /> : null}
      <View style={{ padding: spacing.lg }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Badge label={post.category} tone="primary" />
          {post.isPremium ? <Badge label="Premium" tone="gold" icon="ribbon-outline" /> : null}
        </View>
        <T variant="h1" style={{ marginTop: 12 }}>{post.title}</T>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: c.border }}>
          <Avatar name={post.author?.fullName ?? 'Rehan Success'} size={34} />
          <View>
            <T variant="smallStrong">{post.author?.fullName ?? 'Rehan Success'}</T>
            <T variant="tiny">{formatDateTime(post.createdAt)}</T>
          </View>
        </View>
        <T variant="body" style={{ marginTop: 16, fontSize: 16, lineHeight: 27 }} selectable>{post.content}</T>
        <RiskDisclaimer />
      </View>
    </Screen>
  )
}
