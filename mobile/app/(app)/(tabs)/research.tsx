import React, { useState } from 'react'
import { View, Pressable, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { useApi } from '@/api/hooks'
import { useAuth } from '@/auth/AuthContext'
import { isLocked, IS_IOS_FREE_ONLY } from '@/lib/gating'
import { timeAgo } from '@/lib/format'
import { Screen, LargeHeader, T, Chip, Badge, PlanBadge, Skeleton, ErrorState, EmptyState, LockBanner, useTheme, spacing, radius } from '@/components/ui'
import type { ResearchPost, Plan } from '@/types'

const CATEGORIES = ['All', 'Forex', 'Gold', 'Crypto', 'Stocks', 'Indices', 'Crude Oil']

export default function ResearchScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { c, shadow } = useTheme()
  const plan = (user?.plan ?? 'FREE') as Plan
  const [cat, setCat] = useState('All')
  const { data, isLoading, isError, refetch, isRefetching } = useApi<ResearchPost[]>('/api/research')

  const posts = (data ?? [])
    .filter((p) => p.published)
    // iOS: hide premium posts entirely (App Store IAP rule)
    .filter((p) => !(IS_IOS_FREE_ONLY && p.isPremium))
    .filter((p) => cat === 'All' || p.category === cat)
    .slice(0, 30)

  return (
    <Screen edges={['top']} scroll refreshing={isRefetching} onRefresh={refetch}>
      <LargeHeader title="Research" subtitle="Analysis and trade ideas" right={<PlanBadge plan={plan} />} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
        {CATEGORIES.map((ct) => <Chip key={ct} label={ct} active={ct === cat} onPress={() => setCat(ct)} />)}
      </ScrollView>

      <View style={{ paddingHorizontal: spacing.lg }}>
        {isLoading ? (
          <><Skeleton height={240} /><Skeleton height={140} /></>
        ) : isError ? (
          <ErrorState message="Couldn’t load research" onRetry={() => refetch()} />
        ) : posts.length === 0 ? (
          <EmptyState icon="document-text-outline" title="No research in this category yet" subtitle="New analysis is published regularly." />
        ) : (
          posts.map((post) => {
            const locked = isLocked(post.isPremium, plan)
            return (
              <Pressable
                key={post.id}
                onPress={() => router.push(locked ? '/(app)/order' : (`/(app)/research/${post.id}` as never))}
                accessibilityRole="button"
                accessibilityLabel={`${post.title}${locked ? ', premium, locked' : ''}`}
                style={({ pressed }) => [{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.md, transform: [{ scale: pressed ? 0.99 : 1 }] }, shadow.xs]}
              >
                {post.imageUrl ? <Image source={{ uri: post.imageUrl }} style={{ width: '100%', height: 170, backgroundColor: c.card3 }} contentFit="cover" blurRadius={locked ? 14 : 0} transition={200} /> : null}
                <View style={{ padding: spacing.lg }}>
                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                    <Badge label={post.category} tone="primary" />
                    {post.isPremium ? <Badge label="Premium" tone="gold" icon="ribbon-outline" /> : null}
                  </View>
                  <T variant="h3" style={{ marginTop: 10 }} color={locked ? c.muted : c.ink}>{post.title}</T>
                  {locked ? (
                    <View style={{ marginTop: 10 }}><LockBanner message="Premium analysis · tap to view plans" /></View>
                  ) : (
                    <T variant="small" numberOfLines={3} style={{ marginTop: 6 }}>{post.content}</T>
                  )}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                    <T variant="tiny">By {post.author?.fullName ?? 'Rehan Success'}</T>
                    <T variant="tiny">{timeAgo(post.createdAt)}</T>
                  </View>
                </View>
              </Pressable>
            )
          })
        )}
      </View>
    </Screen>
  )
}
