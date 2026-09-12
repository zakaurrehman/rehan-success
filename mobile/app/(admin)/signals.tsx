import React, { useState } from 'react'
import { View, Alert, ScrollView } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/hooks'
import { apiFetch } from '@/api/client'
import { Screen, Loader, ErrorState, EmptyState, Field, Button, StatusPill, Badge, Chip, Segmented, T, spacing } from '@/components/ui'
import { Select } from '@/components/Select'
import { AdminRow } from '@/components/AdminRow'
import { NewItemForm } from '@/components/NewItemForm'
import { PromptModal } from '@/components/PromptModal'
import { formatPrice } from '@/lib/format'
import type { Signal } from '@/types'

const PAIRS = ['EUR/USD', 'GBP/USD', 'XAU/USD', 'USD/JPY', 'GBP/JPY', 'USD/CHF', 'USD/CAD', 'AUD/USD', 'NZD/USD', 'EUR/JPY', 'USOIL', 'US30', 'NAS100']

export default function AdminSignalsScreen() {
  const qc = useQueryClient()
  const { data, isLoading, isError, refetch, isRefetching } = useApi<Signal[]>('/api/signals?all=1')
  const list = data ?? []
  const [pair, setPair] = useState('XAU/USD')
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY')
  const [entry, setEntry] = useState('')
  const [tp1, setTp1] = useState('')
  const [tp2, setTp2] = useState('')
  const [tp3, setTp3] = useState('')
  const [sl, setSl] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [filter, setFilter] = useState<'ACTIVE' | 'CLOSED'>('ACTIVE')
  const [closing, setClosing] = useState<{ signal: Signal; status: 'HIT_TP' | 'HIT_SL' } | null>(null)

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['/api/signals?all=1'] })
    qc.invalidateQueries({ queryKey: ['/api/signals'] })
  }

  async function create() {
    if (!entry || !tp1 || !sl) { Alert.alert('Missing levels', 'Entry, TP1 and stop loss are required.'); return }
    setBusy(true)
    try {
      await apiFetch('/api/signals', {
        method: 'POST',
        body: { pair, direction, entry: parseFloat(entry), tp1: parseFloat(tp1), tp2: tp2 ? parseFloat(tp2) : null, tp3: tp3 ? parseFloat(tp3) : null, sl: parseFloat(sl), notes: notes || undefined },
      })
      refresh()
      setEntry(''); setTp1(''); setTp2(''); setTp3(''); setSl(''); setNotes('')
      Alert.alert('Signal published', 'Members have been notified.')
    } catch (e) {
      Alert.alert('Could not publish', e instanceof Error ? e.message : 'Try again')
    } finally {
      setBusy(false)
    }
  }

  async function update(id: string, status: 'HIT_TP' | 'HIT_SL' | 'CLOSED' | 'ACTIVE', pips?: number) {
    await apiFetch('/api/signals', { method: 'PATCH', body: { id, status, pips } }).catch(() => {})
    refresh()
  }

  function remove(s: Signal) {
    Alert.alert(`Delete ${s.pair} ${s.direction}?`, 'It will be removed from history and stats. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await apiFetch('/api/signals', { method: 'DELETE', body: { id: s.id } }).catch(() => {}); refresh() } },
    ])
  }

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError) return <Screen><ErrorState message="Couldn’t load signals" onRetry={() => refetch()} /></Screen>

  const shown = list.filter((s) => (filter === 'ACTIVE' ? s.status === 'ACTIVE' : s.status !== 'ACTIVE'))

  return (
    <Screen scroll padded refreshing={isRefetching} onRefresh={refetch}>
      <NewItemForm label="New signal">
        <Select label="Pair" value={pair} options={PAIRS} onChange={setPair} />
        <T variant="label" style={{ marginBottom: 6 }}>Direction</T>
        <View style={{ marginBottom: spacing.md }}>
          <Segmented value={direction} onChange={setDirection} options={[{ key: 'BUY', label: 'Buy' }, { key: 'SELL', label: 'Sell' }]} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Field label="Entry" keyboardType="decimal-pad" value={entry} onChangeText={setEntry} /></View>
          <View style={{ flex: 1 }}><Field label="Stop loss" keyboardType="decimal-pad" value={sl} onChangeText={setSl} /></View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Field label="TP1" keyboardType="decimal-pad" value={tp1} onChangeText={setTp1} /></View>
          <View style={{ flex: 1 }}><Field label="TP2" keyboardType="decimal-pad" value={tp2} onChangeText={setTp2} /></View>
          <View style={{ flex: 1 }}><Field label="TP3" keyboardType="decimal-pad" value={tp3} onChangeText={setTp3} /></View>
        </View>
        <Field label="Analysis notes" multiline numberOfLines={3} style={{ minHeight: 80 }} value={notes} onChangeText={setNotes} />
        <Button title="Publish & notify members" icon="send" onPress={create} loading={busy} />
      </NewItemForm>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: spacing.md }}>
        <Chip label={`Active (${list.filter((s) => s.status === 'ACTIVE').length})`} active={filter === 'ACTIVE'} onPress={() => setFilter('ACTIVE')} />
        <Chip label={`Closed (${list.filter((s) => s.status !== 'ACTIVE').length})`} active={filter === 'CLOSED'} onPress={() => setFilter('CLOSED')} />
      </ScrollView>

      {shown.length === 0 ? (
        <EmptyState icon="flash-outline" title="No signals here" />
      ) : (
        shown.map((s) => (
          <AdminRow
            key={s.id}
            title={`${s.pair}`}
            subtitle={`Entry ${formatPrice(s.entry, s.pair)} · TP ${formatPrice(s.tp1, s.pair)} · SL ${formatPrice(s.sl, s.pair)}${s.pips != null ? ` · ${s.pips} pips` : ''}`}
            badge={<View style={{ alignItems: 'flex-end', gap: 4 }}><Badge label={s.direction} tone={s.direction === 'BUY' ? 'success' : 'danger'} solid /><StatusPill status={s.status} /></View>}
          >
            {s.status === 'ACTIVE' ? (
              <>
                <Button title="TP hit" size="sm" variant="successSoft" block={false} onPress={() => setClosing({ signal: s, status: 'HIT_TP' })} />
                <Button title="SL hit" size="sm" variant="dangerSoft" block={false} onPress={() => setClosing({ signal: s, status: 'HIT_SL' })} />
                <Button title="Close" size="sm" variant="secondary" block={false} onPress={() => update(s.id, 'CLOSED')} />
              </>
            ) : (
              <Button title="Reopen" size="sm" variant="outline" icon="refresh" block={false} onPress={() => update(s.id, 'ACTIVE')} />
            )}
            <Button title="Delete" size="sm" variant="ghost" icon="trash-outline" block={false} onPress={() => remove(s)} />
          </AdminRow>
        ))
      )}

      <PromptModal
        visible={closing !== null}
        title={closing?.status === 'HIT_TP' ? `Close ${closing?.signal.pair} at take profit` : `Close ${closing?.signal.pair} at stop loss`}
        message="Members receive a push notification with the result."
        label={closing?.status === 'HIT_TP' ? 'Pips gained (optional)' : 'Pips lost (optional)'}
        placeholder={closing?.status === 'HIT_TP' ? 'e.g. 125' : 'e.g. -80'}
        keyboardType="numbers-and-punctuation"
        confirmLabel={closing?.status === 'HIT_TP' ? 'Mark TP hit' : 'Mark SL hit'}
        destructive={closing?.status === 'HIT_SL'}
        onCancel={() => setClosing(null)}
        onSubmit={(v) => { if (closing) update(closing.signal.id, closing.status, v ? parseFloat(v) : undefined); setClosing(null) }}
      />
    </Screen>
  )
}
