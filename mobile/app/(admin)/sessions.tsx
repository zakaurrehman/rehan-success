import React, { useState } from 'react'
import { Alert } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/hooks'
import { apiFetch } from '@/api/client'
import { Screen, Loader, ErrorState, EmptyState, Field, Button, Badge } from '@/components/ui'
import { AdminRow } from '@/components/AdminRow'
import { NewItemForm } from '@/components/NewItemForm'
import { formatDateTime } from '@/lib/format'
import type { LiveSession } from '@/types'

export default function AdminSessionsScreen() {
  const qc = useQueryClient()
  const { data, isLoading, isError, refetch, isRefetching } = useApi<LiveSession[]>('/api/live')
  const list = data ?? []
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [streamUrl, setStreamUrl] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [busy, setBusy] = useState(false)

  const refresh = () => qc.invalidateQueries({ queryKey: ['/api/live'] })

  async function create() {
    const when = new Date(scheduledAt.replace(' ', 'T'))
    if (!title || Number.isNaN(when.getTime())) { Alert.alert('Check the form', 'Add a title and a valid date/time (YYYY-MM-DD HH:MM).'); return }
    setBusy(true)
    try {
      await apiFetch('/api/live', { method: 'POST', body: { title, description: description || null, streamUrl: streamUrl || null, scheduledAt: when.toISOString() } })
      refresh(); setTitle(''); setDescription(''); setStreamUrl(''); setScheduledAt('')
    } catch (e) { Alert.alert('Could not schedule', e instanceof Error ? e.message : 'Try again') } finally { setBusy(false) }
  }

  function toggleLive(s: LiveSession) {
    const go = async () => { await apiFetch('/api/live', { method: 'PATCH', body: { id: s.id, isLive: !s.isLive } }).catch(() => {}); refresh() }
    if (s.isLive) return go()
    Alert.alert(`Go live with “${s.title}”?`, 'Every member with the app receives a LIVE NOW notification.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Go live', onPress: go }])
  }

  function remove(s: LiveSession) {
    Alert.alert('Delete session?', `“${s.title}” will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await apiFetch('/api/live', { method: 'DELETE', body: { id: s.id } }).catch(() => {}); refresh() } },
    ])
  }

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError) return <Screen><ErrorState message="Couldn’t load sessions" onRetry={() => refetch()} /></Screen>

  return (
    <Screen scroll padded refreshing={isRefetching} onRefresh={refetch}>
      <NewItemForm label="Schedule session">
        <Field label="Title" value={title} onChangeText={setTitle} />
        <Field label="Description" multiline numberOfLines={3} style={{ minHeight: 80 }} value={description} onChangeText={setDescription} />
        <Field label="Stream URL" autoCapitalize="none" keyboardType="url" value={streamUrl} onChangeText={setStreamUrl} />
        <Field label="Date & time" placeholder="2026-09-20 19:00" hint="Your local time, format YYYY-MM-DD HH:MM" autoCapitalize="none" value={scheduledAt} onChangeText={setScheduledAt} />
        <Button title="Schedule" onPress={create} loading={busy} />
      </NewItemForm>

      {list.length === 0 ? (
        <EmptyState icon="radio-outline" title="No sessions yet" />
      ) : (
        list.map((s) => (
          <AdminRow key={s.id} title={s.title} subtitle={formatDateTime(s.scheduledAt)} badge={<Badge label={s.isLive ? 'LIVE' : 'Scheduled'} tone={s.isLive ? 'danger' : 'primary'} solid={s.isLive} />}>
            <Button title={s.isLive ? 'End live' : 'Go live'} size="sm" variant={s.isLive ? 'danger' : 'successSoft'} icon={s.isLive ? 'stop' : 'radio'} block={false} onPress={() => toggleLive(s)} />
            <Button title="Delete" size="sm" variant="ghost" icon="trash-outline" block={false} onPress={() => remove(s)} />
          </AdminRow>
        ))
      )}
    </Screen>
  )
}
