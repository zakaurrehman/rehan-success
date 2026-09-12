import React from 'react'
import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useApi } from '@/api/hooks'
import { useAuth } from '@/auth/AuthContext'
import { canViewPremium, IS_IOS_FREE_ONLY } from '@/lib/gating'
import { Screen, LargeHeader, T, Card, Badge, ProgressBar, Skeleton, ErrorState, EmptyState, useTheme, spacing } from '@/components/ui'
import type { Plan } from '@/types'

const LEVEL_ORDER = ['Beginner', 'Intermediate', 'Advanced', 'Master', 'COT Research']

type CourseRow = { id: string; title: string; level: string; description: string; isPremium: boolean; videos: { id: string }[]; certificates: { id: string }[] }
type Resp = { courses: CourseRow[]; completed: string[] }

export default function ClassroomScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { c } = useTheme()
  const isPrem = canViewPremium((user?.plan ?? 'FREE') as Plan)
  const { data, isLoading, isError, refetch, isRefetching } = useApi<Resp>('/api/classroom')

  const completed = new Set(data?.completed ?? [])
  const courses = [...(data?.courses ?? [])]
    // iOS: hide premium courses entirely (App Store IAP rule)
    .filter((cr) => !(IS_IOS_FREE_ONLY && cr.isPremium))
    .sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level))

  const total = courses.reduce((s, cr) => s + cr.videos.length, 0)
  const done = courses.reduce((s, cr) => s + cr.videos.filter((v) => completed.has(v.id)).length, 0)
  const certs = courses.filter((cr) => cr.certificates.length > 0).length
  const overall = total ? Math.round((done / total) * 100) : 0

  return (
    <Screen edges={['top']} scroll refreshing={isRefetching} onRefresh={refetch}>
      <LargeHeader title="Learn" subtitle="From fundamentals to Smart Money Concepts" />

      <View style={{ paddingHorizontal: spacing.lg }}>
        {isLoading ? (
          <><Skeleton height={110} /><Skeleton height={130} /><Skeleton height={130} /></>
        ) : isError ? (
          <ErrorState message="Couldn’t load courses" onRetry={() => refetch()} />
        ) : courses.length === 0 ? (
          <EmptyState icon="school-outline" title="No courses published yet" subtitle="Courses will appear here as soon as they’re released." />
        ) : (
          <>
            <Card style={{ marginBottom: spacing.lg }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <T variant="bodyStrong">Your progress</T>
                <T variant="num" color={c.primary}>{overall}%</T>
              </View>
              <View style={{ marginTop: 10 }}><ProgressBar value={overall} /></View>
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
                <T variant="tiny">{done}/{total} lessons</T>
                <T variant="tiny">{courses.length} courses</T>
                <T variant="tiny" color={c.goldText}>{certs} certificate{certs === 1 ? '' : 's'}</T>
              </View>
            </Card>

            {courses.map((course) => {
              const t = course.videos.length
              const d = course.videos.filter((v) => completed.has(v.id)).length
              const pct = t > 0 ? Math.round((d / t) * 100) : 0
              const locked = course.isPremium && !isPrem
              const certified = course.certificates.length > 0
              return (
                <Card key={course.id} style={{ marginBottom: spacing.md }} accessibilityLabel={`${course.title}${locked ? ', locked' : `, ${pct}% complete`}`}
                  onPress={() => router.push(locked ? '/(app)/order' : (`/(app)/classroom/${course.id}` as never))}>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: locked ? c.goldTint : c.primaryTint, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name={locked ? 'lock-closed' : certified ? 'ribbon' : 'play'} size={20} color={locked ? c.goldText : c.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                        <Badge label={course.level} tone="neutral" />
                        {course.isPremium ? <Badge label="Premium" tone="gold" /> : null}
                        {certified ? <Badge label="Certified" tone="success" icon="checkmark" /> : null}
                      </View>
                      <T variant="h3" style={{ marginTop: 8 }} color={locked ? c.muted : c.ink}>{course.title}</T>
                      <T variant="small" numberOfLines={2} style={{ marginTop: 2 }}>{course.description}</T>
                    </View>
                  </View>
                  {locked ? (
                    <T variant="smallStrong" color={c.goldText} style={{ marginTop: 12 }}>Upgrade to unlock →</T>
                  ) : (
                    <View style={{ marginTop: 14 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                        <T variant="tiny">{d}/{t} lessons</T>
                        <T variant="tiny" color={c.ink}>{pct}%</T>
                      </View>
                      <ProgressBar value={pct} />
                    </View>
                  )}
                </Card>
              )
            })}
          </>
        )}
      </View>
    </Screen>
  )
}
