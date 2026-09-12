import React, { useState } from 'react'
import { View, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/hooks'
import { apiFetch } from '@/api/client'
import { formatDateTime, timeAgo } from '@/lib/format'
import { Screen, Loader, ErrorState, Avatar, T, Card, useTheme, spacing, radius, family } from '@/components/ui'
import type { Comment } from '@/types'

type PostDetail = {
  id: string; title: string; content: string; imageUrl?: string | null; createdAt: string
  author: { fullName: string; studentId: string }
  likes: number; dislikes: number; userReaction: 'LIKE' | 'DISLIKE' | null; comments: Comment[]
}

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const qc = useQueryClient()
  const insets = useSafeAreaInsets()
  const { c } = useTheme()
  const key = `/api/community?id=${id}`
  const { data, isLoading, isError, refetch } = useApi<PostDetail>(key)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [reacting, setReacting] = useState(false)

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError || !data) return <Screen><ErrorState message="Post not found" onRetry={() => refetch()} /></Screen>

  async function react(type: 'LIKE' | 'DISLIKE') {
    if (reacting || !data) return
    setReacting(true)
    // Optimistic update mirroring the API's toggle semantics.
    const next = { ...data }
    if (data.userReaction === type) { next.userReaction = null; if (type === 'LIKE') next.likes--; else next.dislikes-- }
    else {
      if (data.userReaction === 'LIKE') next.likes--
      if (data.userReaction === 'DISLIKE') next.dislikes--
      next.userReaction = type
      if (type === 'LIKE') next.likes++; else next.dislikes++
    }
    qc.setQueryData([key], next)
    await apiFetch('/api/community', { method: 'PATCH', body: { postId: id, type } }).catch(() => {})
    qc.invalidateQueries({ queryKey: [key] })
    qc.invalidateQueries({ queryKey: ['/api/community'] })
    setReacting(false)
  }

  async function submitComment() {
    if (!comment.trim()) return
    setBusy(true)
    try {
      await apiFetch('/api/community/comments', { method: 'POST', body: { postId: id, content: comment.trim() } })
      setComment('')
      qc.invalidateQueries({ queryKey: [key] })
      qc.invalidateQueries({ queryKey: ['/api/community'] })
    } finally {
      setBusy(false)
    }
  }

  const ReactBtn = ({ type }: { type: 'LIKE' | 'DISLIKE' }) => {
    const on = data.userReaction === type
    const tone = type === 'LIKE' ? { bg: c.successTint, fg: c.successText, line: c.successLine } : { bg: c.dangerTint, fg: c.dangerText, line: c.dangerLine }
    return (
      <Pressable onPress={() => react(type)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={type === 'LIKE' ? 'Like' : 'Dislike'}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, backgroundColor: on ? tone.bg : c.card, borderColor: on ? tone.line : c.border }}>
        <Ionicons name={type === 'LIKE' ? (on ? 'thumbs-up' : 'thumbs-up-outline') : (on ? 'thumbs-down' : 'thumbs-down-outline')} size={16} color={on ? tone.fg : c.muted} />
        <Text style={{ fontFamily: family.monoBold, fontSize: 13, color: on ? tone.fg : c.muted }}>{type === 'LIKE' ? data.likes : data.dislikes}</Text>
      </Pressable>
    )
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Avatar name={data.author.fullName} size={40} />
            <View style={{ flex: 1 }}>
              <T variant="bodyStrong">{data.author.fullName}</T>
              <T variant="tiny">{data.author.studentId} · {formatDateTime(data.createdAt)}</T>
            </View>
          </View>
          <T variant="h2" style={{ marginTop: 14 }}>{data.title}</T>
          {data.imageUrl ? <Image source={{ uri: data.imageUrl }} style={{ width: '100%', height: 210, borderRadius: radius.md, marginTop: 12, backgroundColor: c.card3 }} contentFit="cover" /> : null}
          <T variant="body" style={{ marginTop: 10, lineHeight: 24 }} selectable>{data.content}</T>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: c.border }}>
            <ReactBtn type="LIKE" />
            <ReactBtn type="DISLIKE" />
          </View>
        </Card>

        <T variant="overline" style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>{data.comments.length} comment{data.comments.length !== 1 ? 's' : ''}</T>
        {data.comments.length === 0 ? <T variant="small" style={{ textAlign: 'center', paddingVertical: 16 }}>No comments yet — start the discussion.</T> : null}
        {data.comments.map((cm) => (
          <View key={cm.id} style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            <Avatar name={cm.authorName} size={32} />
            <View style={{ flex: 1, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: radius.md, padding: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <T variant="smallStrong">{cm.authorName}</T>
                <T variant="tiny" style={{ marginLeft: 'auto' }}>{timeAgo(cm.createdAt)}</T>
              </View>
              <T variant="small" color={c.text} style={{ marginTop: 3 }}>{cm.content}</T>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: spacing.lg, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 10), backgroundColor: c.card, borderTopWidth: 1, borderTopColor: c.border }}>
        <TextInput
          style={{ flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: c.card2, borderWidth: 1, borderColor: c.border, borderRadius: radius.lg, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12, color: c.ink, fontFamily: family.body, fontSize: 15 }}
          placeholder="Add a comment…"
          placeholderTextColor={c.dim}
          value={comment}
          onChangeText={setComment}
          multiline
          accessibilityLabel="Comment"
        />
        <Pressable onPress={submitComment} disabled={busy || !comment.trim()} accessibilityRole="button" accessibilityLabel="Post comment"
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', opacity: busy || !comment.trim() ? 0.5 : 1 }}>
          <Ionicons name={busy ? 'hourglass-outline' : 'send'} size={18} color={c.primaryFg} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}
