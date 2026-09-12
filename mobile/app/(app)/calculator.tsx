import React, { useMemo, useState } from 'react'
import { View, KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Field, Card, T, Chip, Notice, SectionTitle, useTheme, spacing, family } from '@/components/ui'
import { Select } from '@/components/Select'

// Pip multiplier per pair — unchanged from the original calculator.
const PAIRS: Record<string, number> = {
  'EUR/USD': 1, 'GBP/USD': 1, 'AUD/USD': 1, 'NZD/USD': 1,
  'USD/JPY': 100, 'USD/CHF': 1, 'USD/CAD': 1,
  'GBP/JPY': 100, 'EUR/JPY': 100, 'XAU/USD': 1,
}

const RULES: [string, string][] = [
  ['1–2% rule', 'Never risk more than 2% of your account on a single trade.'],
  ['Risk:reward', 'Aim for at least 1:2 — risk $1 to make $2.'],
  ['Correlation', 'Avoid stacking correlated positions at once.'],
  ['Stop loss', 'Always use one. Markets move fast.'],
]

export default function CalculatorScreen() {
  const { c } = useTheme()
  const [account, setAccount] = useState('10000')
  const [risk, setRisk] = useState('1')
  const [pair, setPair] = useState('EUR/USD')
  const [sl, setSl] = useState('20')

  // Same formula as before — computed live.
  const result = useMemo(() => {
    const acct = parseFloat(account)
    const r = parseFloat(risk) / 100
    const slPips = parseFloat(sl)
    const pipMult = PAIRS[pair] || 1
    if (!acct || !r || !slPips) return null
    const riskAmount = acct * r
    const pipValue = 10 / pipMult
    const lotSize = riskAmount / (slPips * pipValue)
    return { lotSize: Math.round(lotSize * 100) / 100, riskAmount: Math.round(riskAmount * 100) / 100, pipValue: Math.round(pipValue * 100) / 100 }
  }, [account, risk, pair, sl])

  const riskNum = parseFloat(risk)

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        {/* Result first so it stays visible while typing */}
        <View style={{ backgroundColor: '#0b3f3b', borderRadius: 24, padding: spacing.xl }} accessibilityLiveRegion="polite">
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: family.bodyMedium, fontSize: 13 }}>Position size</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 4 }}>
            <Text style={{ color: '#fff', fontFamily: family.monoBold, fontSize: 44, letterSpacing: -1.5 }}>{result ? result.lotSize : '—'}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontFamily: family.body, fontSize: 14, marginBottom: 10 }}>lots</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 10 }}>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontFamily: family.body, fontSize: 11 }}>At risk</Text>
              <Text style={{ color: '#fca5a5', fontFamily: family.monoBold, fontSize: 16, marginTop: 2 }}>{result ? `$${result.riskAmount.toLocaleString()}` : '—'}</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 10 }}>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontFamily: family.body, fontSize: 11 }}>Pip value / lot</Text>
              <Text style={{ color: '#fff', fontFamily: family.monoBold, fontSize: 16, marginTop: 2 }}>{result ? `$${result.pipValue}` : '—'}</Text>
            </View>
          </View>
        </View>

        <Card style={{ marginTop: spacing.lg }}>
          <Field label="Account balance (USD)" icon="wallet-outline" keyboardType="decimal-pad" value={account} onChangeText={setAccount} placeholder="10000" />
          <Field label="Risk per trade (%)" icon="shield-checkmark-outline" keyboardType="decimal-pad" value={risk} onChangeText={setRisk} placeholder="1" />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: -4, marginBottom: spacing.md }}>
            {['0.5', '1', '2'].map((r) => <Chip key={r} label={`${r}%`} active={risk === r} onPress={() => setRisk(r)} />)}
          </View>
          <Select label="Instrument" value={pair} options={Object.keys(PAIRS)} onChange={setPair} />
          <Field label="Stop loss (pips)" icon="remove-circle-outline" keyboardType="decimal-pad" value={sl} onChangeText={setSl} placeholder="20" />
          {riskNum > 2 ? <Notice tone="danger" icon="warning-outline" message="Risking more than 2% per trade can wipe out an account quickly." /> : null}
        </Card>

        <SectionTitle>Risk management rules</SectionTitle>
        <Card>
          {RULES.map(([title, desc], i) => (
            <View key={title} style={{ flexDirection: 'row', gap: 12, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: c.border }}>
              <Ionicons name="checkmark-circle" size={20} color={c.primary} />
              <View style={{ flex: 1 }}>
                <T variant="smallStrong">{title}</T>
                <T variant="small">{desc}</T>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
