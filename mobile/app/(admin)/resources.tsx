import React, { useState } from 'react'
import { Alert } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/hooks'
import { apiFetch } from '@/api/client'
import { Screen, Loader, ErrorState, EmptyState, Field, Button, Badge, type Tone } from '@/components/ui'
import { Select } from '@/components/Select'
import { AdminRow } from '@/components/AdminRow'
import { NewItemForm } from '@/components/NewItemForm'
import type { Resource, ResourceTier } from '@/types'

const TIERS: ResourceTier[] = ['FREE', 'BASIC', 'PREMIUM']
const CATEGORIES = ['Forex Basics', 'ICT Concepts', 'Risk Management', 'COT Research', 'Chart Patterns', 'Psychology']
const TONE: Record<string, Tone> = { FREE: 'success', BASIC: 'primary', PREMIUM: 'gold' }

export default function AdminResourcesScreen() {
  const qc = useQueryClient()
  const { data, isLoading, isError, refetch, isRefetching } = useApi<Resource[]>('/api/resources')
  const items = data ?? []
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [category, setCategory] = useState('Forex Basics')
  const [tier, setTier] = useState<ResourceTier>('FREE')
  const [busy, setBusy] = useState(false)

  const refresh = () => qc.invalidateQueries({ queryKey: ['/api/resources'] })

  async function create() {
    if (!title || !description || !fileUrl) { Alert.alert('Missing fields', 'Title, description and file URL are required.'); return }
    setBusy(true)
    try {
      await apiFetch('/api/resources', { method: 'POST', body: { title, description, fileUrl, category, tier } })
      refresh(); setTitle(''); setDescription(''); setFileUrl('')
    } catch (e) { Alert.alert('Could not add resource', e instanceof Error ? e.message : 'Try again') } finally { setBusy(false) }
  }

  function remove(r: Resource) {
    Alert.alert('Delete resource?', `“${r.title}” will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await apiFetch('/api/resources', { method: 'DELETE', body: { id: r.id } }).catch(() => {}); refresh() } },
    ])
  }

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError) return <Screen><ErrorState message="Couldn’t load resources" onRetry={() => refetch()} /></Screen>

  return (
    <Screen scroll padded refreshing={isRefetching} onRefresh={refetch}>
      <NewItemForm label="New resource">
        <Field label="Title" value={title} onChangeText={setTitle} />
        <Field label="Description" multiline numberOfLines={3} style={{ minHeight: 80 }} value={description} onChangeText={setDescription} />
        <Field label="File URL" autoCapitalize="none" keyboardType="url" value={fileUrl} onChangeText={setFileUrl} />
        <Select label="Category" value={category} options={CATEGORIES} onChange={setCategory} />
        <Select label="Tier" value={tier} options={TIERS} onChange={(v) => setTier(v as ResourceTier)} />
        <Button title="Add resource" onPress={create} loading={busy} />
      </NewItemForm>

      {items.length === 0 ? (
        <EmptyState icon="folder-open-outline" title="No resources yet" />
      ) : (
        items.map((r) => (
          <AdminRow key={r.id} title={r.title} subtitle={`${r.category} · ${r.downloads} downloads`} badge={<Badge label={r.tier} tone={TONE[r.tier] ?? 'neutral'} />}>
            <Button title="Delete" size="sm" variant="ghost" icon="trash-outline" block={false} onPress={() => remove(r)} />
          </AdminRow>
        ))
      )}
    </Screen>
  )
}
