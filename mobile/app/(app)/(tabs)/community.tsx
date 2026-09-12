import React from 'react'
import { View, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useApi } from '@/api/hooks'
import { useAuth } from '@/auth/AuthContext'
import { timeAgo } from '@/lib/format'
import { Screen, LargeHeader, T, Avatar, Skeleton, ErrorState, EmptyState, Button, useTheme, spacing, radius } from '@/components/ui'
import type { CommunityPost } from '@/types'

export default function CommunityScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { c, shadow } = useTheme()
  const { data, isLoading, isError, refetch, isRefetching } = useApi<CommunityPost[]>('/api/community')
  const posts = data ?? []

  return (
    <Screen edges={['top']} scroll refreshing={isRefetching} onRefresh={refetch}>
      <LargeHeader title="Community" subtitle="Share analysis and learn together" />

      <View style={{ paddingHorizontal: spacing.lg }}>
        <Pressable onPress={() => router.push('/(app)/community/new')} accessibilityRole="button" accessibilityLabel="Create a post"
          style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: radius.lg, padding: 12, marginBottom: spacing.lg, opacity: pressed ? 0.9 : 1 }, shadow.xs]}>
          <Avatar name={user?.fullName || 'You'} size={36} />
          <T variant="body" color={c.dim} style={{ flex: 1 }}>Share an idea or ask a question…</T>
          <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="create-outline" size={18} color={c.primaryFg} />
          </View>
        </Pressable>

        {isLoading ? (
          <><Skeleton height={150} /><Skeleton height={150} /></>
        ) : isError ? (
          <ErrorState message="Couldn’t load the community" onRetry={() => refetch()} />
        ) : posts.length === 0 ? (
          <EmptyState icon="chatbubbles-outline" title="No posts yet" subtitle="Start the conversation." action={<Button title="Create the first post" onPress={() => router.push('/(app)/community/new')} />} />
        ) : (
          posts.map((post) => {
            const likes = post.reactions.filter((r) => r.type === 'LIKE').length
            const dislikes = post.reactions.filter((r) => r.type === 'DISLIKE').length
            return (
              <Pressable key={post.id} onPress={() => router.push(`/(app)/community/${post.id}` as never)} accessibilityRole="button" accessibilityLabel={post.title}
                style={({ pressed }) => [{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, transform: [{ scale: pressed ? 0.99 : 1 }] }, shadow.xs]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Avatar name={post.author.fullName} size={38} />
                  <View style={{ flex: 1 }}>
                    <T variant="smallStrong" numberOfLines={1}>{post.author.fullName}</T>
                    <T variant="tiny">{post.author.studentId} · {timeAgo(post.createdAt)}</T>
                  </View>
                </View>
                <T variant="h3" style={{ marginTop: 12 }}>{post.title}</T>
                <T variant="small" numberOfLines={3} style={{ marginTop: 4 }}>{post.content}</T>
                {post.imageUrl ? <Image source={{ uri: post.imageUrl }} style={{ width: '100%', height: 170, borderRadius: radius.md, marginTop: 12, backgroundColor: c.card3 }} contentFit="cover" /> : null}
                <View style={{ flexDirection: 'row', gap: 18, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border }}>
                  <Stat icon="thumbs-up-outline" value={likes} />
                  <Stat icon="thumbs-down-outline" value={dislikes} />
                  <Stat icon="chatbubble-outline" value={post.comments.length} />
                </View>
              </Pressable>
            )
          })
        )}
      </View>
    </Screen>
  )
}

function Stat({ icon, value }: { icon: keyof typeof Ionicons.glyphMap; value: number }) {
  const { c } = useTheme()
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <Ionicons name={icon} size={15} color={c.dim} />
      <T variant="tiny" color={c.muted}>{value}</T>
    </View>
  )
}
