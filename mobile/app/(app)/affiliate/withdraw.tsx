import React, { useState } from 'react'
import { View, ScrollView, KeyboardAvoidingView, Platform, Text } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/hooks'
import { apiFetch } from '@/api/client'
import { Field, Button, Loader, Card, T, Notice, SectionTitle, StatusPill, ListRow, TextLink, useTheme, spacing, family } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/format'

type Resp = { available: number; requests: { id: string; amount: number; status: string; createdAt: string; note?: string | null }[] }

export default function WithdrawScreen() {
  const qc = useQueryClient()
  const { c } = useTheme()
  const { data, isLoading } = useApi<Resp>('/api/withdrawals')
  const available = data?.available ?? 0
  const requests = data?.requests ?? []
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const value = parseFloat(amount)
  const fieldError = amount && (Number.isNaN(value) || value <= 0) ? 'Enter a valid amount' : value > available ? `Cannot exceed ${formatCurrency(available)}` : undefined

  async function submit() {
    if (!amount || fieldError) { setError(fieldError || 'Enter an amount'); return }
    setBusy(true)
    setError('')
    try {
      await apiFetch('/api/withdrawals', { method: 'POST', body: { amount: value, note } })
      qc.invalidateQueries({ queryKey: ['/api/withdrawals'] })
      qc.invalidateQueries({ queryKey: ['/api/mobile/affiliate'] })
      setAmount('')
      setNote('')
      setSuccess(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit')
    } finally {
      setBusy(false)
    }
  }

  if (isLoading) return <Loader />

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor: '#0b3f3b', borderRadius: 24, padding: spacing.xl }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: family.bodyMedium, fontSize: 13 }}>Available balance</Text>
          <Text style={{ color: '#fff', fontFamily: family.monoBold, fontSize: 38, letterSpacing: -1.2, marginTop: 4 }}>{formatCurrency(available)}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontFamily: family.body, fontSize: 12, marginTop: 4 }}>Payouts are reviewed within 24–48 hours.</Text>
        </View>

        {success ? (
          <View style={{ marginTop: spacing.md }}><Notice tone="success" icon="checkmark-circle" message="Withdrawal requested. We’ll notify you when it’s paid." /></View>
        ) : null}

        <Card style={{ marginTop: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <T variant="label">Amount (USD)</T>
            {available > 0 ? <TextLink title="Withdraw max" onPress={() => setAmount(available.toFixed(2))} /> : null}
          </View>
          <Field icon="cash-outline" keyboardType="decimal-pad" placeholder="0.00" value={amount} onChangeText={(t) => { setAmount(t); setSuccess(false) }} error={fieldError} />
          <Field label="Payout details" placeholder="e.g. USDT TRC20: TXxx… or Bank: Jane Doe, Acct 1234" multiline numberOfLines={3} style={{ minHeight: 90 }} value={note} onChangeText={setNote} hint="Where should we send the money?" />
          {error ? <View style={{ marginBottom: spacing.md }}><Notice tone="danger" icon="alert-circle-outline" message={error} /></View> : null}
          <Button title="Request withdrawal" icon="send" size="lg" onPress={submit} loading={busy} disabled={available <= 0} />
        </Card>

        <SectionTitle>Request history</SectionTitle>
        {requests.length === 0 ? (
          <T variant="small">No requests yet.</T>
        ) : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {requests.map((r, i) => (
              <ListRow key={r.id} icon="wallet-outline" title={formatCurrency(r.amount)} subtitle={`${formatDate(r.createdAt)}${r.note ? ` · ${r.note}` : ''}`} last={i === requests.length - 1} right={<StatusPill status={r.status} />} />
            ))}
          </Card>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
