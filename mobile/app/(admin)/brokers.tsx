import React, { useState } from 'react'
import { Alert, View } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/hooks'
import { apiFetch } from '@/api/client'
import { Screen, Loader, ErrorState, EmptyState, Field, Button, Badge, Segmented, T, spacing } from '@/components/ui'
import { AdminRow } from '@/components/AdminRow'
import { NewItemForm } from '@/components/NewItemForm'
import type { Broker } from '@/types'

type AdminBroker = Broker & { isActive?: boolean }

export default function AdminBrokersScreen() {
  const qc = useQueryClient()
  const { data, isLoading, isError, refetch, isRefetching } = useApi<AdminBroker[]>('/api/brokers?all=1')
  const brokers = data ?? []
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [rating, setRating] = useState('4.5')
  const [link, setLink] = useState('')
  const [minDeposit, setMinDeposit] = useState('')
  const [regulation, setRegulation] = useState('')
  const [recommended, setRecommended] = useState<'no' | 'yes'>('no')
  const [busy, setBusy] = useState(false)

  const refresh = () => { qc.invalidateQueries({ queryKey: ['/api/brokers?all=1'] }); qc.invalidateQueries({ queryKey: ['/api/brokers'] }) }

  async function create() {
    if (!name || !link || !description) { Alert.alert('Missing fields', 'Name, link and description are required.'); return }
    setBusy(true)
    try {
      await apiFetch('/api/brokers', { method: 'POST', body: { name, description, rating: parseFloat(rating), link, minDeposit: minDeposit || undefined, regulation: regulation || undefined, isRecommended: recommended === 'yes' } })
      refresh(); setName(''); setDescription(''); setLink(''); setMinDeposit(''); setRegulation('')
    } catch (e) { Alert.alert('Could not add broker', e instanceof Error ? e.message : 'Try again') } finally { setBusy(false) }
  }

  async function patch(b: AdminBroker, body: Record<string, unknown>) {
    await apiFetch('/api/brokers', { method: 'PATCH', body: { id: b.id, ...body } }).catch(() => {})
    refresh()
  }

  function remove(b: AdminBroker) {
    Alert.alert('Delete broker?', `“${b.name}” will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await apiFetch('/api/brokers', { method: 'DELETE', body: { id: b.id } }).catch(() => {}); refresh() } },
    ])
  }

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError) return <Screen><ErrorState message="Couldn’t load brokers" onRetry={() => refetch()} /></Screen>

  return (
    <Screen scroll padded refreshing={isRefetching} onRefresh={refetch}>
      <NewItemForm label="New broker">
        <Field label="Name" value={name} onChangeText={setName} />
        <Field label="Description" multiline numberOfLines={3} style={{ minHeight: 80 }} value={description} onChangeText={setDescription} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Field label="Rating (1–5)" keyboardType="decimal-pad" value={rating} onChangeText={setRating} /></View>
          <View style={{ flex: 1 }}><Field label="Min deposit" value={minDeposit} onChangeText={setMinDeposit} /></View>
        </View>
        <Field label="Affiliate link" autoCapitalize="none" keyboardType="url" value={link} onChangeText={setLink} />
        <Field label="Regulation" value={regulation} onChangeText={setRegulation} />
        <T variant="label" style={{ marginBottom: 6 }}>Our pick</T>
        <View style={{ marginBottom: spacing.md }}>
          <Segmented value={recommended} onChange={setRecommended} options={[{ key: 'no', label: 'No' }, { key: 'yes', label: 'Yes' }]} />
        </View>
        <Button title="Add broker" onPress={create} loading={busy} />
      </NewItemForm>

      {brokers.length === 0 ? (
        <EmptyState icon="business-outline" title="No brokers yet" />
      ) : (
        brokers.map((b) => (
          <AdminRow key={b.id} title={b.name} subtitle={b.description.slice(0, 90)}
            badge={<View style={{ alignItems: 'flex-end', gap: 4 }}>{b.isRecommended ? <Badge label="Our pick" tone="gold" /> : null}{b.isActive === false ? <Badge label="Hidden" tone="neutral" /> : null}</View>}>
            <Button title={b.isRecommended ? 'Unfeature' : 'Feature'} size="sm" variant="secondary" block={false} onPress={() => patch(b, { isRecommended: !b.isRecommended })} />
            <Button title={b.isActive === false ? 'Show' : 'Hide'} size="sm" variant="secondary" block={false} onPress={() => patch(b, { isActive: b.isActive === false })} />
            <Button title="Delete" size="sm" variant="ghost" icon="trash-outline" block={false} onPress={() => remove(b)} />
          </AdminRow>
        ))
      )}
    </Screen>
  )
}
