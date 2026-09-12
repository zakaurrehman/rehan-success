import React, { useState } from 'react'
import { Alert, View } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/hooks'
import { apiFetch } from '@/api/client'
import { Screen, Loader, ErrorState, EmptyState, Field, Button, Badge } from '@/components/ui'
import { Select } from '@/components/Select'
import { AdminRow } from '@/components/AdminRow'
import { NewItemForm } from '@/components/NewItemForm'
import { PromptModal } from '@/components/PromptModal'
import { formatDateTime } from '@/lib/format'
import type { EconomicEvent, Impact } from '@/types'

const IMPACTS: Impact[] = ['HIGH', 'MEDIUM', 'LOW']
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD']

export default function AdminCalendarScreen() {
  const qc = useQueryClient()
  const { data, isLoading, isError, refetch, isRefetching } = useApi<EconomicEvent[]>('/api/calendar')
  const events = data ?? []
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [impact, setImpact] = useState<Impact>('HIGH')
  const [eventTime, setEventTime] = useState('')
  const [forecast, setForecast] = useState('')
  const [previous, setPrevious] = useState('')
  const [busy, setBusy] = useState(false)
  const [actualFor, setActualFor] = useState<EconomicEvent | null>(null)

  const refresh = () => qc.invalidateQueries({ queryKey: ['/api/calendar'] })

  async function create() {
    const when = new Date(eventTime.replace(' ', 'T'))
    if (!name || Number.isNaN(when.getTime())) { Alert.alert('Check the form', 'Add a name and a valid date/time (YYYY-MM-DD HH:MM).'); return }
    setBusy(true)
    try {
      await apiFetch('/api/calendar', { method: 'POST', body: { name, currency, impact, eventTime: when.toISOString(), forecast: forecast || undefined, previous: previous || undefined } })
      refresh(); setName(''); setEventTime(''); setForecast(''); setPrevious('')
    } catch (e) { Alert.alert('Could not add event', e instanceof Error ? e.message : 'Try again') } finally { setBusy(false) }
  }

  function remove(ev: EconomicEvent) {
    Alert.alert('Delete event?', `“${ev.name}” will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await apiFetch('/api/calendar', { method: 'DELETE', body: { id: ev.id } }).catch(() => {}); refresh() } },
    ])
  }

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError) return <Screen><ErrorState message="Couldn’t load the calendar" onRetry={() => refetch()} /></Screen>

  return (
    <Screen scroll padded refreshing={isRefetching} onRefresh={refetch}>
      <NewItemForm label="New event">
        <Field label="Name" placeholder="Non-Farm Payrolls" value={name} onChangeText={setName} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Select label="Currency" value={currency} options={CURRENCIES} onChange={setCurrency} /></View>
          <View style={{ flex: 1 }}><Select label="Impact" value={impact} options={IMPACTS} onChange={(v) => setImpact(v as Impact)} /></View>
        </View>
        <Field label="Date & time" placeholder="2026-09-20 14:30" hint="Local time, YYYY-MM-DD HH:MM" autoCapitalize="none" value={eventTime} onChangeText={setEventTime} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Field label="Forecast" value={forecast} onChangeText={setForecast} /></View>
          <View style={{ flex: 1 }}><Field label="Previous" value={previous} onChangeText={setPrevious} /></View>
        </View>
        <Button title="Add event" onPress={create} loading={busy} />
      </NewItemForm>

      {events.length === 0 ? (
        <EmptyState icon="calendar-outline" title="No events yet" />
      ) : (
        events.map((e) => (
          <AdminRow
            key={e.id}
            title={`${e.currency} · ${e.name}`}
            subtitle={`${formatDateTime(e.eventTime)}${e.forecast ? ` · Fcst ${e.forecast}` : ''}${e.previous ? ` · Prev ${e.previous}` : ''}${e.actual ? ` · Actual ${e.actual}` : ''}`}
            badge={<Badge label={e.impact} tone={e.impact === 'HIGH' ? 'danger' : e.impact === 'MEDIUM' ? 'warning' : 'success'} />}
          >
            <Button title={e.actual ? 'Edit actual' : 'Add actual'} size="sm" variant="outline" block={false} onPress={() => setActualFor(e)} />
            <Button title="Delete" size="sm" variant="ghost" icon="trash-outline" block={false} onPress={() => remove(e)} />
          </AdminRow>
        ))
      )}

      <PromptModal
        visible={actualFor !== null}
        title={`Actual — ${actualFor?.name ?? ''}`}
        label="Actual result"
        placeholder="e.g. 210K"
        initialValue={actualFor?.actual ?? ''}
        required
        onCancel={() => setActualFor(null)}
        onSubmit={async (v) => {
          const id = actualFor?.id
          setActualFor(null)
          if (id && v.trim()) { await apiFetch('/api/calendar', { method: 'PATCH', body: { id, actual: v.trim() } }).catch(() => {}); refresh() }
        }}
      />
    </Screen>
  )
}
