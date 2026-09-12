import React, { useState, useEffect } from 'react'
import { View, Pressable, Text } from 'react-native'
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { WebView } from 'react-native-webview'
import { useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/hooks'
import { apiFetch, ApiError } from '@/api/client'
import { Screen, Loader, ErrorState, EmptyState, Button, ProgressBar, T, Badge, Notice, useTheme, spacing, radius, family } from '@/components/ui'

type Video = { id: string; title: string; url: string; duration?: string | null; isPremium: boolean }
type Course = { id: string; title: string; level: string; description: string; videos: Video[] }
type Resp = { course: Course; completed: string[] }

function toEmbedUrl(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?playsinline=1`
  return url
}

export default function CourseDetailScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>()
  const router = useRouter()
  const navigation = useNavigation()
  const qc = useQueryClient()
  const { c } = useTheme()
  const key = `/api/classroom?courseId=${courseId}`
  const { data, isLoading, isError, error, refetch } = useApi<Resp>(key, { retry: (count, e) => (e as ApiError)?.status !== 403 && count < 1 })
  const [activeId, setActiveId] = useState<string | null>(null)
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    if (!activeId && data?.course.videos[0]) setActiveId(data.course.videos[0].id)
    if (data?.course.title) navigation.setOptions({ title: data.course.title })
  }, [data, activeId, navigation])

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError && (error as ApiError)?.status === 403) {
    return <Screen padded><EmptyState icon="lock-closed-outline" title="Premium course" subtitle="Upgrade to the Premium plan to access this course." action={<Button title="View plans" variant="gold" onPress={() => router.replace('/(app)/order')} />} /></Screen>
  }
  if (isError || !data) return <Screen><ErrorState message="Course not found" onRetry={() => refetch()} /></Screen>

  const { course, completed } = data
  const done = course.videos.filter((v) => completed.includes(v.id)).length
  const total = course.videos.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const active = course.videos.find((v) => v.id === activeId) ?? course.videos[0]
  const activeIdx = active ? course.videos.findIndex((v) => v.id === active.id) : -1

  async function markComplete(videoId: string) {
    setMarking(true)
    try {
      await apiFetch('/api/classroom', { method: 'POST', body: { videoId } })
      const next = [...completed, videoId]
      qc.setQueryData([key], { ...data, completed: next })
      qc.invalidateQueries({ queryKey: ['/api/classroom'] })
      qc.invalidateQueries({ queryKey: ['/api/mobile/profile'] })
      const upNext = course.videos.slice(activeIdx + 1).find((v) => !next.includes(v.id))
      if (upNext) setActiveId(upNext.id)
    } catch {
      /* keep state; user can retry */
    } finally {
      setMarking(false)
    }
  }

  return (
    <Screen scroll>
      {active ? (
        <View style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' }}>
          <WebView source={{ uri: toEmbedUrl(active.url) }} allowsFullscreenVideo allowsInlineMediaPlayback javaScriptEnabled domStorageEnabled style={{ flex: 1, backgroundColor: '#000' }} />
        </View>
      ) : null}

      <View style={{ padding: spacing.lg }}>
        <Badge label={course.level} tone="neutral" />
        {active ? (
          <>
            <T variant="tiny" style={{ marginTop: 10 }}>Lesson {activeIdx + 1} of {total}</T>
            <T variant="h2" style={{ marginTop: 2 }}>{active.title}</T>
            <View style={{ marginTop: spacing.md }}>
              {completed.includes(active.id) ? (
                <Notice tone="success" icon="checkmark-circle" message="Lesson completed" />
              ) : (
                <Button title="Mark lesson complete" variant="success" icon="checkmark" onPress={() => markComplete(active.id)} loading={marking} />
              )}
            </View>
          </>
        ) : (
          <EmptyState icon="videocam-outline" title="No lessons yet" />
        )}

        <View style={{ marginTop: spacing.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <T variant="smallStrong">{done}/{total} complete</T>
            <T variant="num" color={c.primary} style={{ fontSize: 14 }}>{pct}%</T>
          </View>
          <ProgressBar value={pct} />
        </View>

        {pct === 100 ? (
          <View style={{ marginTop: spacing.md }}><Notice tone="gold" icon="trophy" message="Course complete! Your certificate has been issued — find it in Account." /></View>
        ) : null}

        <T variant="overline" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>Lessons</T>
        <View style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: radius.lg, overflow: 'hidden' }}>
          {course.videos.map((v, i) => {
            const isActive = active?.id === v.id
            const isDone = completed.includes(v.id)
            return (
              <Pressable key={v.id} onPress={() => setActiveId(v.id)} accessibilityRole="button" accessibilityState={{ selected: isActive }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderTopWidth: i ? 1 : 0, borderTopColor: c.border, backgroundColor: isActive ? c.primaryTint : 'transparent' }}>
                <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: isDone ? c.success : isActive ? c.primary : c.card3 }}>
                  {isDone ? <Ionicons name="checkmark" size={16} color="#fff" /> : <Text style={{ fontFamily: family.bodyBold, fontSize: 12, color: isActive ? c.primaryFg : c.muted }}>{i + 1}</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <T variant={isActive ? 'smallStrong' : 'small'} color={isActive ? c.primary : c.ink} numberOfLines={2}>{v.title}</T>
                  {v.duration ? <T variant="tiny">{v.duration}</T> : null}
                </View>
                {isActive ? <Ionicons name="play" size={14} color={c.primary} /> : null}
              </Pressable>
            )
          })}
        </View>
        {course.description ? <T variant="small" style={{ marginTop: spacing.lg }}>{course.description}</T> : null}
      </View>
    </Screen>
  )
}
