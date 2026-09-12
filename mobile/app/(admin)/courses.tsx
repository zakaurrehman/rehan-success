import React, { useState } from 'react'
import { View, Alert } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/hooks'
import { apiFetch } from '@/api/client'
import { Screen, Loader, ErrorState, EmptyState, Field, Button, Badge, Segmented, T, useTheme, spacing } from '@/components/ui'
import { Select } from '@/components/Select'
import { AdminRow } from '@/components/AdminRow'
import { NewItemForm } from '@/components/NewItemForm'

type Video = { id: string; title: string; url: string; duration?: string | null; isPremium: boolean }
type Course = { id: string; title: string; level: string; description: string; isPremium: boolean; videos: Video[] }
type Resp = { courses: Course[] }

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Master', 'COT Research']

export default function AdminCoursesScreen() {
  const qc = useQueryClient()
  const { c } = useTheme()
  const { data, isLoading, isError, refetch, isRefetching } = useApi<Resp>('/api/classroom?admin=1')
  const courses = data?.courses ?? []
  const [title, setTitle] = useState('')
  const [level, setLevel] = useState('Beginner')
  const [description, setDescription] = useState('')
  const [premium, setPremium] = useState<'free' | 'premium'>('free')
  const [vCourseId, setVCourseId] = useState('')
  const [vTitle, setVTitle] = useState('')
  const [vUrl, setVUrl] = useState('')
  const [vDuration, setVDuration] = useState('')
  const [vPremium, setVPremium] = useState<'free' | 'premium'>('free')
  const [busy, setBusy] = useState(false)

  const refresh = () => { qc.invalidateQueries({ queryKey: ['/api/classroom?admin=1'] }); qc.invalidateQueries({ queryKey: ['/api/classroom'] }) }

  async function createCourse() {
    if (!title || !description) { Alert.alert('Missing fields', 'Title and description are required.'); return }
    setBusy(true)
    try {
      await apiFetch('/api/classroom', { method: 'POST', body: { type: 'course', title, level, description, isPremium: premium === 'premium' } })
      refresh(); setTitle(''); setDescription('')
    } catch (e) { Alert.alert('Could not create course', e instanceof Error ? e.message : 'Try again') } finally { setBusy(false) }
  }

  async function createVideo() {
    if (!vCourseId || !vTitle || !vUrl) { Alert.alert('Missing fields', 'Choose a course and add a title and URL.'); return }
    setBusy(true)
    try {
      await apiFetch('/api/classroom', { method: 'POST', body: { type: 'video', courseId: vCourseId, title: vTitle, url: vUrl, duration: vDuration || null, isPremium: vPremium === 'premium' } })
      refresh(); setVTitle(''); setVUrl(''); setVDuration('')
    } catch (e) { Alert.alert('Could not add video', e instanceof Error ? e.message : 'Try again') } finally { setBusy(false) }
  }

  function removeCourse(cr: Course) {
    Alert.alert(`Delete “${cr.title}”?`, `Removes ${cr.videos.length} video(s), all student progress and certificates for this course.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await apiFetch('/api/classroom', { method: 'DELETE', body: { type: 'course', id: cr.id } }).catch(() => {}); refresh() } },
    ])
  }

  function removeVideo(v: Video) {
    Alert.alert(`Delete “${v.title}”?`, 'Student progress for this video is removed too.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await apiFetch('/api/classroom', { method: 'DELETE', body: { type: 'video', id: v.id } }).catch(() => {}); refresh() } },
    ])
  }

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError) return <Screen><ErrorState message="Couldn’t load courses" onRetry={() => refetch()} /></Screen>

  const AccessToggle = ({ value, onChange }: { value: 'free' | 'premium'; onChange: (v: 'free' | 'premium') => void }) => (
    <View style={{ marginBottom: spacing.md }}>
      <T variant="label" style={{ marginBottom: 6 }}>Access</T>
      <Segmented value={value} onChange={onChange} options={[{ key: 'free', label: 'Free' }, { key: 'premium', label: 'Premium' }]} />
    </View>
  )

  return (
    <Screen scroll padded refreshing={isRefetching} onRefresh={refetch}>
      <NewItemForm label="New course">
        <Field label="Title" value={title} onChangeText={setTitle} />
        <Select label="Level" value={level} options={LEVELS} onChange={setLevel} />
        <Field label="Description" multiline numberOfLines={3} style={{ minHeight: 80 }} value={description} onChangeText={setDescription} />
        <AccessToggle value={premium} onChange={setPremium} />
        <Button title="Create course" onPress={createCourse} loading={busy} />
      </NewItemForm>

      <NewItemForm label="Add video">
        <Select label="Course" value={vCourseId} placeholder="Select a course" options={courses.map((cr) => ({ label: cr.title, value: cr.id }))} onChange={setVCourseId} />
        <Field label="Video title" value={vTitle} onChangeText={setVTitle} />
        <Field label="YouTube URL" autoCapitalize="none" keyboardType="url" value={vUrl} onChangeText={setVUrl} />
        <Field label="Duration (e.g. 12:34)" value={vDuration} onChangeText={setVDuration} />
        <AccessToggle value={vPremium} onChange={setVPremium} />
        <Button title="Add video" onPress={createVideo} loading={busy} />
      </NewItemForm>

      {courses.length === 0 ? (
        <EmptyState icon="school-outline" title="No courses yet" />
      ) : (
        courses.map((cr) => (
          <AdminRow key={cr.id} title={cr.title} subtitle={`${cr.level} · ${cr.videos.length} video${cr.videos.length === 1 ? '' : 's'}`}
            badge={<Badge label={cr.isPremium ? 'Premium' : 'Free'} tone={cr.isPremium ? 'gold' : 'success'} />}>
            <View style={{ width: '100%' }}>
              {cr.videos.map((v, i) => (
                <View key={v.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderTopWidth: i ? 1 : 0, borderTopColor: c.border }}>
                  <T variant="tiny" style={{ width: 18 }}>{i + 1}</T>
                  <T variant="small" color={c.ink} style={{ flex: 1 }} numberOfLines={1}>{v.title}</T>
                  {v.isPremium ? <Badge label="P" tone="gold" /> : null}
                  <Button title="" icon="trash-outline" size="sm" variant="ghost" block={false} accessibilityLabel={`Delete ${v.title}`} onPress={() => removeVideo(v)} />
                </View>
              ))}
              <Button title="Delete course" size="sm" variant="dangerSoft" icon="trash-outline" style={{ marginTop: 8 }} onPress={() => removeCourse(cr)} />
            </View>
          </AdminRow>
        ))
      )}
    </Screen>
  )
}
