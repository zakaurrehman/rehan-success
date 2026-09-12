import React, { useState } from 'react'
import { View, Pressable, ScrollView, Platform, KeyboardAvoidingView, Text } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { Ionicons } from '@expo/vector-icons'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'expo-router'
import { apiFetch } from '@/api/client'
import { useAuth } from '@/auth/AuthContext'
import { Screen, Field, Button, Card, T, Badge, Notice, EmptyState, useTheme, spacing, radius, family } from '@/components/ui'
import { Select } from '@/components/Select'
import { SERVICES } from '@/lib/format'
import { PAYMENT_METHODS } from '@/lib/constants'
import { WEBSITE_URL, WEBSITE_HOST, SUPPORT_EMAIL } from '@/lib/site'

type Service = (typeof SERVICES)[number]

/**
 * iOS: Apple forbids selling digital content outside In-App Purchase, so no
 * prices or order form are shown — members manage plans on the website.
 */
function IosOrderRedirect() {
  return (
    <Screen padded contentStyle={{ justifyContent: 'center' }}>
      <EmptyState
        icon="globe-outline"
        title="Manage your plan on the web"
        subtitle="Account upgrades and billing are handled on our website. Sign in there with the same account — anything you unlock appears here automatically."
        action={<Button title={`Open ${WEBSITE_HOST}`} icon="open-outline" onPress={() => WebBrowser.openBrowserAsync(WEBSITE_URL)} />}
      />
    </Screen>
  )
}

const schema = z.object({
  clientName: z.string().min(2, 'Full name required'),
  clientEmail: z.string().email('Valid email required'),
  phone: z.string().min(4, 'Phone required'),
  country: z.string().min(2, 'Country required'),
  referralCode: z.string().optional(),
  paymentMethod: z.string().min(1, 'Choose a payment method'),
  paymentNote: z.string().min(2, 'Add your transaction ID or proof'),
})
type FormData = z.infer<typeof schema>

export default function OrderScreen() {
  if (Platform.OS === 'ios') return <IosOrderRedirect />
  return <AndroidOrderScreen />
}

function AndroidOrderScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { c } = useTheme()
  const [selected, setSelected] = useState<Service | null>(null)
  const [success, setSuccess] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { clientName: user?.fullName ?? '', clientEmail: user?.email ?? '', phone: '', country: '', referralCode: '', paymentMethod: '', paymentNote: '' },
  })

  async function onSubmit(d: FormData) {
    if (!selected) return
    setBusy(true)
    setError('')
    try {
      await apiFetch('/api/order', { method: 'POST', body: { ...d, service: selected.name, amount: selected.price }, auth: false })
      setSuccess(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit your order')
    } finally {
      setBusy(false)
    }
  }

  if (success) {
    return (
      <Screen padded contentStyle={{ justifyContent: 'center' }}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 76, height: 76, borderRadius: 24, backgroundColor: c.successTint, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="checkmark-circle" size={44} color={c.successText} />
          </View>
          <T variant="h1" style={{ marginTop: spacing.xl, textAlign: 'center' }}>Order received</T>
          <T variant="body" color={c.muted} style={{ marginTop: 8, textAlign: 'center', marginBottom: spacing.xxl }}>We’re verifying your payment for {selected?.name}. Access is usually granted within 24 hours.</T>
        </View>
        <Button title="Done" size="lg" onPress={() => router.back()} />
      </Screen>
    )
  }

  if (!selected) {
    return (
      <Screen scroll padded>
        <T variant="h1">Choose your plan</T>
        <T variant="small" style={{ marginTop: 4, marginBottom: spacing.lg }}>One-time courses or a monthly signals subscription.</T>
        {SERVICES.filter((s) => !('comingSoon' in s && s.comingSoon)).map((svc) => {
          const popular = 'popular' in svc && svc.popular
          const best = 'bestValue' in svc && svc.bestValue
          const monthly = 'monthly' in svc && svc.monthly
          return (
            <Card key={svc.name} onPress={() => setSelected(svc)} accessibilityLabel={`${svc.name}, $${svc.price}`}
              style={{ marginBottom: spacing.md, borderColor: popular ? c.primary : c.border, borderWidth: popular ? 1.5 : 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  {popular ? <Badge label="Most popular" tone="primary" solid /> : best ? <Badge label="Best value" tone="gold" /> : null}
                  <T variant="h3" style={{ marginTop: popular || best ? 8 : 0 }}>{svc.name}</T>
                  <T variant="small">{svc.description}</T>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <T variant="num" style={{ fontSize: 22 }}>${svc.price}</T>
                  <T variant="tiny">{monthly ? '/ month' : 'one-time'}</T>
                </View>
              </View>
              <View style={{ marginTop: 12, gap: 5 }}>
                {svc.features.map((f) => (
                  <View key={f} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <Ionicons name="checkmark" size={15} color={c.primary} />
                    <T variant="small" color={c.text}>{f}</T>
                  </View>
                ))}
              </View>
            </Card>
          )
        })}
      </Screen>
    )
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={undefined}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <T variant="overline">Order summary</T>
            <Pressable onPress={() => setSelected(null)} hitSlop={8} accessibilityRole="button"><Text style={{ color: c.primary, fontFamily: family.bodySemi, fontSize: 13 }}>Change</Text></Pressable>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <T variant="h3" style={{ flex: 1 }}>{selected.name}</T>
            <T variant="numLg">${selected.price}</T>
          </View>
        </Card>

        <View style={{ marginTop: spacing.md, backgroundColor: c.primaryTint, borderWidth: 1, borderColor: c.primaryLine, borderRadius: radius.lg, padding: spacing.lg }}>
          <T variant="smallStrong" color={c.primary}>How payment works</T>
          {[
            `Send $${selected.price} by bank transfer, USDT (TRC20) or another listed method. Contact ${SUPPORT_EMAIL} for payment details.`,
            'Enter your details and paste the transaction ID below.',
            'We verify and activate your access within 24 hours.',
          ].map((line, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: c.primaryFg, fontFamily: family.bodyBold, fontSize: 11 }}>{i + 1}</Text>
              </View>
              <T variant="small" color={c.text} style={{ flex: 1 }}>{line}</T>
            </View>
          ))}
        </View>

        <Card style={{ marginTop: spacing.md }}>
          <Controller control={control} name="clientName" render={({ field: { onChange, value } }) => (
            <Field label="Full name" placeholder="Jane Doe" value={value} onChangeText={onChange} error={errors.clientName?.message} />
          )} />
          <Controller control={control} name="clientEmail" render={({ field: { onChange, value } }) => (
            <Field label="Email" hint="Use your account email so we can upgrade it." keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" value={value} onChangeText={onChange} error={errors.clientEmail?.message} />
          )} />
          <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
            <Field label="Phone" keyboardType="phone-pad" placeholder="+1 234 567 8900" value={value} onChangeText={onChange} error={errors.phone?.message} />
          )} />
          <Controller control={control} name="country" render={({ field: { onChange, value } }) => (
            <Field label="Country" placeholder="United States" value={value} onChangeText={onChange} error={errors.country?.message} />
          )} />
          <Controller control={control} name="referralCode" render={({ field: { onChange, value } }) => (
            <Field label="Referral code (optional)" placeholder="XXXX000000" autoCapitalize="characters" value={value} onChangeText={onChange} />
          )} />
          <Controller control={control} name="paymentMethod" render={({ field: { onChange, value } }) => (
            <Select label="Payment method" placeholder="Select method" options={PAYMENT_METHODS} value={value} onChange={onChange} error={errors.paymentMethod?.message} />
          )} />
          <Controller control={control} name="paymentNote" render={({ field: { onChange, value } }) => (
            <Field label="Transaction ID / payment proof" placeholder="Paste your transaction reference" multiline numberOfLines={3} style={{ minHeight: 90 }} value={value} onChangeText={onChange} error={errors.paymentNote?.message} />
          )} />
          {error ? <View style={{ marginBottom: spacing.md }}><Notice tone="danger" icon="alert-circle-outline" message={error} /></View> : null}
          <Button title={`Submit order · $${selected.price}`} size="lg" onPress={handleSubmit(onSubmit)} loading={busy} />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
