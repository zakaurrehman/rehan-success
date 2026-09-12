import React, { useState } from 'react'
import { Alert } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/hooks'
import { apiFetch } from '@/api/client'
import { Screen, Loader, ErrorState, EmptyState, Field, Button, Badge, Segmented, T, spacing } from '@/components/ui'
import { Select } from '@/components/Select'
import { AdminRow } from '@/components/AdminRow'
import { NewItemForm } from '@/components/NewItemForm'
import { formatDate } from '@/lib/format'
import type { ResearchPost } from '@/types'
import { View } from 'react-native'

const CATEGORIES = ['Forex', 'Gold', 'Crypto', 'Stocks', 'Indices', 'Crude Oil']

export default function AdminResearchScreen() {
  const qc = useQueryClient()
  const { data, isLoading, isError, refetch, isRefetching } = useApi<ResearchPost[]>('/api/research?admin=1')
  const posts = data ?? []
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Forex')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [premium, setPremium] = useState<'free' | 'premium'>('free')
  const [busy, setBusy] = useState(false)

  const refresh = () => { qc.invalidateQueries({ queryKey: ['/api/research?admin=1'] }); qc.invalidateQueries({ queryKey: ['/api/research'] }) }

  async function create() {
    if (!title || !content) { Alert.alert('Missing fields', 'Title and content are required.'); return }
    setBusy(true)
    try {
      await apiFetch('/api/research', { method: 'POST', body: { title, category, content, imageUrl: imageUrl || undefined, isPremium: premium === 'premium' } })
      refresh()
      setTitle(''); setContent(''); setImageUrl('')
    } catch (e) { Alert.alert('Could not publish', e instanceof Error ? e.message : 'Try again') } finally { setBusy(false) }
  }

  async function toggle(p: ResearchPost, field: 'published' | 'isPremium') {
    await apiFetch('/api/research', { method: 'PATCH', body: { id: p.id, [field]: !p[field] } }).catch(() => {})
    refresh()
  }

  function remove(p: ResearchPost) {
    Alert.alert('Delete post?', `“${p.title}” will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await apiFetch('/api/research', { method: 'DELETE', body: { id: p.id } }).catch(() => {}); refresh() } },
    ])
  }

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError) return <Screen><ErrorState message="Couldn’t load research" onRetry={() => refetch()} /></Screen>

  return (
    <Screen scroll padded refreshing={isRefetching} onRefresh={refetch}>
      <NewItemForm label="New research post">
        <Field label="Title" value={title} onChangeText={setTitle} />
        <Select label="Category" value={category} options={CATEGORIES} onChange={setCategory} />
        <Field label="Content" multiline numberOfLines={6} style={{ minHeight: 150 }} value={content} onChangeText={setContent} />
        <Field label="Image URL (optional)" autoCapitalize="none" keyboardType="url" value={imageUrl} onChangeText={setImageUrl} />
        <T variant="label" style={{ marginBottom: 6 }}>Access</T>
        <View style={{ marginBottom: spacing.md }}>
          <Segmented value={premium} onChange={setPremium} options={[{ key: 'free', label: 'Everyone' }, { key: 'premium', label: 'Premium only' }]} />
        </View>
        <Button title="Publish" icon="send" onPress={create} loading={busy} />
      </NewItemForm>

      {posts.length === 0 ? (
        <EmptyState icon="document-text-outline" title="No research posts yet" />
      ) : (
        posts.map((p) => (
          <AdminRow key={p.id} title={p.title} subtitle={`${p.category} · ${formatDate(p.createdAt)}`}
            badge={<View style={{ alignItems: 'flex-end', gap: 4 }}><Badge label={p.published ? 'Published' : 'Hidden'} tone={p.published ? 'success' : 'neutral'} />{p.isPremium ? <Badge label="Premium" tone="gold" /> : null}</View>}>
            <Button title={p.published ? 'Hide' : 'Publish'} size="sm" variant="secondary" block={false} onPress={() => toggle(p, 'published')} />
            <Button title={p.isPremium ? 'Make free' : 'Make premium'} size="sm" variant="secondary" block={false} onPress={() => toggle(p, 'isPremium')} />
            <Button title="Delete" size="sm" variant="ghost" icon="trash-outline" block={false} onPress={() => remove(p)} />
          </AdminRow>
        ))
      )}
    </Screen>
  )
}
