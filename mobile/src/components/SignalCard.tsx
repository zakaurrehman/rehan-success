import React from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { makeStyles, useTheme, radius, family } from '@/theme'
import { formatDateTime, formatPrice } from '@/lib/format'
import { Badge } from '@/components/ui'
import type { Signal } from '@/types'

const STATUS: Record<Signal['status'], { label: string; tone: 'success' | 'primary' | 'danger' | 'neutral' }> = {
  ACTIVE: { label: 'Active', tone: 'success' },
  HIT_TP: { label: 'TP hit', tone: 'primary' },
  HIT_SL: { label: 'SL hit', tone: 'danger' },
  CLOSED: { label: 'Closed', tone: 'neutral' },
}

const useStyles = makeStyles((c) => ({
  card: { backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: radius.lg, marginBottom: 12, flexDirection: 'row', overflow: 'hidden' },
  rail: { width: 4 },
  body: { flex: 1, padding: 14 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  dirIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pair: { color: c.ink, fontFamily: family.display, fontSize: 17, letterSpacing: -0.3 },
  date: { color: c.dim, fontFamily: family.body, fontSize: 12, marginTop: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  cell: { flexGrow: 1, flexBasis: '30%', backgroundColor: c.card2, borderWidth: 1, borderColor: c.border, borderRadius: radius.sm, paddingVertical: 7, paddingHorizontal: 9 },
  cellLabel: { fontFamily: family.bodyBold, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: c.dim },
  cellValue: { fontFamily: family.monoBold, fontSize: 14, color: c.ink, marginTop: 2 },
  notes: { color: c.muted, fontFamily: family.body, fontSize: 13, lineHeight: 19, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: c.border },
  image: { width: '100%', height: 170, borderRadius: radius.md, marginTop: 12 },
}))

function Level({ label, value, tone }: { label: string; value: string; tone?: 'tp' | 'sl' }) {
  const s = useStyles()
  const { c } = useTheme()
  return (
    <View style={[s.cell, tone === 'tp' && { borderColor: c.successLine }, tone === 'sl' && { borderColor: c.dangerLine }]}>
      <Text style={[s.cellLabel, tone === 'tp' && { color: c.successText }, tone === 'sl' && { color: c.dangerText }]}>{label}</Text>
      <Text style={s.cellValue} numberOfLines={1}>{value}</Text>
    </View>
  )
}

export default function SignalCard({ signal, compact }: { signal: Signal; compact?: boolean }) {
  const s = useStyles()
  const { c } = useTheme()
  const isBuy = signal.direction === 'BUY'
  const st = STATUS[signal.status]
  const p = (v: number) => formatPrice(v, signal.pair)

  return (
    <View style={s.card} accessible accessibilityLabel={`${signal.pair} ${signal.direction} signal, ${st.label}`}>
      <View style={[s.rail, { backgroundColor: isBuy ? c.success : c.danger }]} />
      <View style={s.body}>
        <View style={s.head}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
            <View style={[s.dirIcon, { backgroundColor: isBuy ? c.successTint : c.dangerTint }]}>
              <Ionicons name={isBuy ? 'trending-up' : 'trending-down'} size={20} color={isBuy ? c.successText : c.dangerText} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={s.pair}>{signal.pair}</Text>
                <Badge label={signal.direction} tone={isBuy ? 'success' : 'danger'} solid />
              </View>
              <Text style={s.date}>{formatDateTime(signal.createdAt)}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Badge label={st.label} tone={st.tone} />
            {signal.pips != null ? (
              <Text style={{ fontFamily: family.monoBold, fontSize: 13, color: signal.pips >= 0 ? c.successText : c.dangerText }}>
                {signal.pips >= 0 ? '+' : ''}{signal.pips} pips
              </Text>
            ) : null}
          </View>
        </View>

        <View style={s.grid}>
          <Level label="Entry" value={p(signal.entry)} />
          <Level label="TP1" value={p(signal.tp1)} tone="tp" />
          <Level label="Stop" value={p(signal.sl)} tone="sl" />
          {!compact && signal.tp2 ? <Level label="TP2" value={p(signal.tp2)} tone="tp" /> : null}
          {!compact && signal.tp3 ? <Level label="TP3" value={p(signal.tp3)} tone="tp" /> : null}
        </View>

        {!compact && signal.imageUrl ? <Image source={{ uri: signal.imageUrl }} style={s.image} contentFit="cover" /> : null}
        {!compact && signal.notes ? <Text style={s.notes}>{signal.notes}</Text> : null}
      </View>
    </View>
  )
}
