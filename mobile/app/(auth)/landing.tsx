import React, { useState } from 'react'
import { View, Text, ScrollView, Pressable, Platform, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'
import { useApi } from '@/api/hooks'
import { Screen, Button, T, Card, Badge, Logo, LogoMark, Avatar, useTheme, makeStyles, spacing, radius, family, type IconName } from '@/components/ui'
import { WEBSITE_URL, WEBSITE_HOST, SUPPORT_EMAIL } from '@/lib/site'
import type { Review, SignalStat } from '@/types'

const FEATURES: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'flash-outline', title: 'Live signal desk', desc: 'BUY/SELL calls with Entry, TP and Stop Loss, pushed to your phone instantly.' },
  { icon: 'school-outline', title: 'ICT & SMC classroom', desc: 'Structured courses from fundamentals to Smart Money Concepts.' },
  { icon: 'document-text-outline', title: 'Market research', desc: 'Regular analysis on Forex, Gold, indices and more.' },
  { icon: 'calculator-outline', title: 'Risk tools', desc: 'Position-size every trade and track high-impact economic events.' },
  { icon: 'gift-outline', title: '50% affiliate commission', desc: 'Share your link and earn half of every plan sold through it.' },
]

const PLANS = [
  { name: 'Basic Training', price: '30', period: 'one-time', features: ['Forex fundamentals', 'Chart reading', 'Risk management guide'] },
  { name: 'Advanced Strategies', price: '103', period: 'one-time', features: ['Advanced analysis', 'Entry & exit frameworks', 'Weekly live sessions'], badge: 'Most popular', highlight: true },
  { name: 'Mastery Bundle', price: '124', period: 'one-time', features: ['Full course library', 'Masterclasses', 'Trade reviews'], badge: 'Best value' },
  { name: 'Premium Signals', price: '51', period: 'month', features: ['Daily signals', 'XAU/USD & majors', 'Win-rate tracking'] },
  { name: 'Personal Mentorship', price: '207', period: 'one-time', features: ['4 private calls', 'Personal trade plan', 'Portfolio review'] },
]

const FAQ = [
  { q: 'How do the signals work?', a: 'You receive clear BUY/SELL signals with exact Entry, TP1, TP2 and Stop Loss levels plus a short rationale, delivered in the app with a push notification.' },
  { q: 'How quickly do I get access?', a: 'Within 24 hours of payment confirmation — most accounts are unlocked much sooner.' },
  { q: 'What is the affiliate program?', a: 'Share your referral link and earn 50% commission on every plan purchased through it. Request withdrawals from your dashboard.' },
  { q: 'Do I need experience?', a: 'No. Basic Training is built for beginners and covers fundamentals, chart reading and risk management.' },
]

const useStyles = makeStyles((c) => ({
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: 10 },
  hero: { marginHorizontal: spacing.lg, marginTop: spacing.sm, borderRadius: radius.xxl, backgroundColor: '#0b3f3b', overflow: 'hidden', padding: spacing.xl },
  glow: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(45,212,191,0.18)', top: -120, right: -100 },
  heroTitle: { color: '#fff', fontFamily: family.displayHeavy, fontSize: 36, lineHeight: 40, letterSpacing: -1 },
  heroAccent: { color: '#5eead4' },
  heroSub: { color: 'rgba(255,255,255,0.75)', fontFamily: family.body, fontSize: 15, lineHeight: 22, marginTop: 12 },
  chipDark: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.10)', marginBottom: 16 },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xxxl },
  level: { flex: 1, backgroundColor: c.card2, borderWidth: 1, borderColor: c.border, borderRadius: radius.sm, padding: 9 },
  levelLabel: { fontFamily: family.bodyBold, fontSize: 10, letterSpacing: 0.8, color: c.dim },
  levelValue: { fontFamily: family.monoBold, fontSize: 14, color: c.ink, marginTop: 2 },
  iconTile: { width: 42, height: 42, borderRadius: 13, backgroundColor: c.primaryTint, alignItems: 'center', justifyContent: 'center' },
  faq: { borderBottomWidth: 1, borderBottomColor: c.border },
}))

export default function LandingScreen() {
  const router = useRouter()
  const { c } = useTheme()
  const s = useStyles()
  const reviews = useApi<Review[]>('/api/reviews')
  const stats = useApi<{ current: SignalStat | null }>('/api/signals?stats=1')
  const cur = stats.data?.current

  return (
    <Screen edges={['top']}>
      <View style={s.topbar}>
        <Logo size={30} />
        <Button title="Sign in" variant="secondary" size="sm" block={false} onPress={() => router.push('/(auth)/login')} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Hero */}
        <View style={s.hero}>
          <View style={s.glow} />
          <View style={s.chipDark}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#5eead4' }} />
            <Text style={{ color: '#fff', fontFamily: family.bodySemi, fontSize: 11, letterSpacing: 0.4 }}>Signals · Education · Research</Text>
          </View>
          <Text style={s.heroTitle}>Disciplined trading.{'\n'}<Text style={s.heroAccent}>Lasting success.</Text></Text>
          <Text style={s.heroSub}>A professional signal desk, a structured Smart Money classroom and daily research — in your pocket.</Text>
          {cur ? (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.md, padding: 12 }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontFamily: family.body, fontSize: 11 }}>{cur.month} win rate</Text>
                <Text style={{ color: '#fff', fontFamily: family.monoBold, fontSize: 22, marginTop: 2 }}>{cur.winRate}%</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.md, padding: 12 }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontFamily: family.body, fontSize: 11 }}>Pips gained</Text>
                <Text style={{ color: '#5eead4', fontFamily: family.monoBold, fontSize: 22, marginTop: 2 }}>+{cur.pipsGained}</Text>
              </View>
            </View>
          ) : null}
          <View style={{ gap: 10, marginTop: 22 }}>
            <Pressable onPress={() => router.push('/(auth)/login')} accessibilityRole="button"
              style={({ pressed }) => ({ height: 52, borderRadius: radius.md, backgroundColor: '#2dd4bf', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, opacity: pressed ? 0.9 : 1 })}>
              <Text style={{ color: '#0b1020', fontFamily: family.bodyBold, fontSize: 15 }}>Sign in to your account</Text>
              <Ionicons name="arrow-forward" size={17} color="#0b1020" />
            </Pressable>
            <Pressable onPress={() => router.push('/(auth)/register')} accessibilityRole="button"
              style={({ pressed }) => ({ height: 52, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.85 : 1 })}>
              <Text style={{ color: '#fff', fontFamily: family.bodySemi, fontSize: 15 }}>Become an affiliate</Text>
            </Pressable>
          </View>
        </View>

        {/* Sample signal */}
        <View style={s.section}>
          <T variant="overline">What you receive</T>
          <T variant="h1" style={{ marginTop: 6, marginBottom: spacing.lg }}>Every signal, fully planned</T>
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <T variant="tiny">XAU/USD · H4</T>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <T variant="h2">Gold</T>
                  <Badge label="BUY" tone="success" solid />
                </View>
              </View>
              <Badge label="Sample" tone="neutral" />
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
              <View style={s.level}><Text style={s.levelLabel}>ENTRY</Text><Text style={s.levelValue}>2,345.50</Text></View>
              <View style={[s.level, { borderColor: c.successLine }]}><Text style={[s.levelLabel, { color: c.successText }]}>TP1</Text><Text style={s.levelValue}>2,358.00</Text></View>
              <View style={[s.level, { borderColor: c.dangerLine }]}><Text style={[s.levelLabel, { color: c.dangerText }]}>STOP</Text><Text style={s.levelValue}>2,335.00</Text></View>
            </View>
            <T variant="small" style={{ marginTop: 12 }}>Rationale: H4 break of structure, order-block retest, liquidity above 2,370. Risk 1%.</T>
          </Card>
        </View>

        {/* Features */}
        <View style={s.section}>
          <T variant="overline">The platform</T>
          <T variant="h1" style={{ marginTop: 6, marginBottom: spacing.lg }}>Your whole routine, one app</T>
          <Card style={{ padding: 0 }}>
            {FEATURES.map((f, i) => (
              <View key={f.title} style={{ flexDirection: 'row', gap: 14, padding: spacing.lg, borderTopWidth: i ? 1 : 0, borderTopColor: c.border }}>
                <View style={s.iconTile}><Ionicons name={f.icon} size={20} color={c.primary} /></View>
                <View style={{ flex: 1 }}>
                  <T variant="bodyStrong">{f.title}</T>
                  <T variant="small" style={{ marginTop: 2 }}>{f.desc}</T>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Pricing — Android only (App Store rules forbid non-IAP prices on iOS) */}
        {Platform.OS !== 'ios' ? (
          <View style={s.section}>
            <T variant="overline">Plans</T>
            <T variant="h1" style={{ marginTop: 6, marginBottom: spacing.lg }}>Simple, transparent pricing</T>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: spacing.lg }} style={{ marginHorizontal: -spacing.lg, paddingLeft: spacing.lg }}>
              {PLANS.map((p) => (
                <Card key={p.name} style={{ width: 240, borderColor: p.highlight ? c.primary : c.border, borderWidth: p.highlight ? 1.5 : 1 }}>
                  {p.badge ? <Badge label={p.badge} tone={p.highlight ? 'primary' : 'gold'} solid={p.highlight} /> : <View style={{ height: 22 }} />}
                  <T variant="h3" style={{ marginTop: 10 }}>{p.name}</T>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
                    <T variant="numLg">${p.price}</T>
                    <T variant="tiny">/ {p.period}</T>
                  </View>
                  <View style={{ marginTop: 12, gap: 6 }}>
                    {p.features.map((f) => (
                      <View key={f} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <Ionicons name="checkmark" size={16} color={c.primary} />
                        <T variant="small" color={c.text}>{f}</T>
                      </View>
                    ))}
                  </View>
                  <Button title="Get started" variant={p.highlight ? 'primary' : 'secondary'} size="sm" style={{ marginTop: 16 }} onPress={() => router.push('/(auth)/register')} />
                </Card>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Reviews */}
        {reviews.data && reviews.data.length > 0 ? (
          <View style={s.section}>
            <T variant="overline">Testimonials</T>
            <T variant="h1" style={{ marginTop: 6, marginBottom: spacing.lg }}>What traders say</T>
            {reviews.data.slice(0, 3).map((r) => (
              <Card key={r.id} style={{ marginBottom: spacing.md }}>
                <Text style={{ color: c.gold, fontSize: 14, letterSpacing: 2 }}>{'★'.repeat(r.rating)}</Text>
                <T variant="body" style={{ marginTop: 8 }}>“{r.content}”</T>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}>
                  <Avatar name={r.clientName} size={30} />
                  <T variant="smallStrong">{r.clientName}</T>
                </View>
              </Card>
            ))}
          </View>
        ) : null}

        {/* FAQ */}
        <View style={s.section}>
          <T variant="overline">FAQ</T>
          <T variant="h1" style={{ marginTop: 6, marginBottom: spacing.md }}>Questions, answered</T>
          {FAQ.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </View>

        {/* Footer */}
        <View style={[s.section, { alignItems: 'center' }]}>
          <LogoMark size={44} />
          <T variant="small" style={{ textAlign: 'center', marginTop: 12 }}>Questions? Visit our website or contact support.</T>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <Button title={WEBSITE_HOST} variant="secondary" size="sm" icon="globe-outline" block={false} onPress={() => WebBrowser.openBrowserAsync(WEBSITE_URL)} />
            <Button title="Email" variant="secondary" size="sm" icon="mail-outline" block={false} onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => {})} />
          </View>
          <T variant="tiny" style={{ textAlign: 'center', marginTop: spacing.xl, lineHeight: 17 }}>
            Risk disclaimer: trading Forex carries a high risk of loss and is not suitable for all investors. Past performance does not guarantee future results. Rehan Success provides educational content only and is not a financial adviser.
          </T>
          <T variant="tiny" style={{ marginTop: 10 }}>© {new Date().getFullYear()} Rehan Success</T>
        </View>
      </ScrollView>
    </Screen>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  const { c } = useTheme()
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: c.border }}>
      <Pressable onPress={() => setOpen((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 }}>
        <T variant="bodyStrong" style={{ flex: 1 }}>{q}</T>
        <Ionicons name={open ? 'remove' : 'add'} size={20} color={c.primary} />
      </Pressable>
      {open ? <T variant="small" style={{ paddingBottom: 16, lineHeight: 20 }}>{a}</T> : null}
    </View>
  )
}
