import React, { useState } from 'react'
import { Alert, View } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/hooks'
import { apiFetch } from '@/api/client'
import { Screen, Loader, ErrorState, EmptyState, Field, Button, T, useTheme } from '@/components/ui'
import { Select } from '@/components/Select'
import { AdminRow } from '@/components/AdminRow'
import { NewItemForm } from '@/components/NewItemForm'
import { formatCurrency, formatDate } from '@/lib/format'

type Sale = { id: string; clientName: string; clientEmail: string; amount: number; description?: string | null; createdAt: string; affiliate?: { fullName: string } }
type AffOption = { id: string; fullName: string; username: string }

export default function AdminSalesScreen() {
  const qc = useQueryClient()
  const { c } = useTheme()
  const { data, isLoading, isError, refetch, isRefetching } = useApi<Sale[]>('/api/admin/sales')
  const aff = useApi<AffOption[]>('/api/admin/affiliates-list')
  const list = data ?? []
  const affOptions = (aff.data ?? []).map((a) => ({ label: `${a.fullName} (@${a.username})`, value: a.id }))

  const [affiliateId, setAffiliateId] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const value = parseFloat(amount)

  async function create() {
    if (!affiliateId || !clientName || !clientEmail || !amount) { Alert.alert('Missing fields', 'Choose an affiliate and fill in the client and amount.'); return }
    setBusy(true)
    try {
      await apiFetch('/api/admin/sales', { method: 'POST', body: { affiliateId, clientName, clientEmail, amount: value, description: description || undefined } })
      qc.invalidateQueries({ queryKey: ['/api/admin/sales'] })
      qc.invalidateQueries({ queryKey: ['/api/admin/affiliates'] })
      setClientName(''); setClientEmail(''); setAmount(''); setDescription('')
      Alert.alert('Sale logged', 'Commission created and the affiliate was notified.')
    } catch (e) { Alert.alert('Could not log sale', e instanceof Error ? e.message : 'Try again') } finally { setBusy(false) }
  }

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError) return <Screen><ErrorState message="Couldn’t load sales" onRetry={() => refetch()} /></Screen>

  return (
    <Screen scroll padded refreshing={isRefetching} onRefresh={refetch}>
      <NewItemForm label="Record a sale" defaultOpen={list.length === 0}>
        <Select label="Affiliate" value={affiliateId} options={affOptions} onChange={setAffiliateId} placeholder="Select an approved affiliate" />
        <Field label="Client name" value={clientName} onChangeText={setClientName} />
        <Field label="Client email" keyboardType="email-address" autoCapitalize="none" value={clientEmail} onChangeText={setClientEmail} />
        <Field label="Amount (USD)" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} hint={Number.isFinite(value) ? `Affiliate commission (50%): ${formatCurrency(value * 0.5)}` : '50% commission is created automatically'} />
        <Field label="Description (optional)" value={description} onChangeText={setDescription} />
        <Button title="Save sale" icon="checkmark" onPress={create} loading={busy} />
      </NewItemForm>

      {list.length === 0 ? (
        <EmptyState icon="cash-outline" title="No sales yet" />
      ) : (
        list.map((s) => (
          <AdminRow key={s.id} title={s.clientName} subtitle={`${s.affiliate?.fullName ?? '—'} · ${formatDate(s.createdAt)}${s.description ? `\n${s.description}` : ''}`}
            badge={<View style={{ alignItems: 'flex-end' }}><T variant="num">{formatCurrency(s.amount)}</T><T variant="tiny" color={c.successText}>+{formatCurrency(s.amount * 0.5)}</T></View>} />
        ))
      )}
    </Screen>
  )
}
