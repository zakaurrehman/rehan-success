import React, { useEffect, useState } from 'react'
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Screen, Field, Button, T, Notice, TextLink, Card, useTheme, spacing } from '@/components/ui'
import { Select } from '@/components/Select'
import { useAuth } from '@/auth/AuthContext'
import { COUNTRIES, PAYMENT_METHODS } from '@/lib/constants'
import { getRefCode, clearRefCode } from '@/lib/refcode'

const schema = z
  .object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().min(4, 'Phone is required'),
    city: z.string().optional(),
    country: z.string().min(1, 'Select your country'),
    username: z.string().min(3, 'Username must be 3+ characters'),
    password: z.string().min(8, 'Use at least 8 characters'),
    confirmPassword: z.string(),
    paymentMethod: z.string().min(1, 'Select a payout method'),
    socialHandle: z.string().optional(),
    referralCode: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })
type FormData = z.infer<typeof schema>

export default function RegisterScreen() {
  const { register } = useAuth()
  const { c } = useTheme()
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', phone: '', city: '', country: '', username: '', password: '', confirmPassword: '', paymentMethod: '', socialHandle: '', referralCode: '' },
  })

  useEffect(() => {
    getRefCode().then((code) => { if (code) setValue('referralCode', code) })
  }, [setValue])

  async function onSubmit(data: FormData) {
    setError('')
    setLoading(true)
    try {
      await register({
        fullName: data.fullName, email: data.email, phone: data.phone, country: data.country,
        username: data.username, password: data.password, paymentMethod: data.paymentMethod,
        socialHandle: data.socialHandle, referralCode: data.referralCode,
      })
      await clearRefCode()
      setSuccess(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Screen edges={['top', 'bottom']} padded contentStyle={{ justifyContent: 'center' }}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 76, height: 76, borderRadius: 24, backgroundColor: c.successTint, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="checkmark-circle" size={44} color={c.successText} />
          </View>
          <T variant="h1" style={{ marginTop: spacing.xl, textAlign: 'center' }}>Application submitted</T>
          <T variant="body" color={c.muted} style={{ marginTop: 8, textAlign: 'center', marginBottom: spacing.xxl }}>Your affiliate account is under review. You can sign in as soon as it’s approved.</T>
        </View>
        <Button title="Back to sign in" size="lg" onPress={() => router.replace('/(auth)/login')} />
      </Screen>
    )
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={{ marginTop: spacing.xl }}>
      <T variant="overline" style={{ marginBottom: spacing.sm }}>{title}</T>
      <Card>{children}</Card>
    </View>
  )

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 48 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/landing'))} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back"
            style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: c.card, borderWidth: 1, borderColor: c.border }}>
            <Ionicons name="chevron-back" size={20} color={c.ink} />
          </Pressable>

          <T variant="display" style={{ marginTop: spacing.xl }}>Become an affiliate</T>
          <T variant="body" color={c.muted} style={{ marginTop: 6 }}>Earn 50% commission on every plan you refer.</T>

          <Section title="Personal details">
            <Controller control={control} name="fullName" render={({ field: { onChange, value } }) => (
              <Field label="Full name" placeholder="Jane Doe" autoComplete="name" value={value} onChangeText={onChange} error={errors.fullName?.message} />
            )} />
            <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
              <Field label="Email" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" value={value} onChangeText={onChange} error={errors.email?.message} />
            )} />
            <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
              <Field label="Phone" placeholder="+1 234 567 8900" keyboardType="phone-pad" autoComplete="tel" value={value} onChangeText={onChange} error={errors.phone?.message} />
            )} />
            <Controller control={control} name="country" render={({ field: { onChange, value } }) => (
              <Select label="Country" placeholder="Select your country" options={COUNTRIES} value={value} onChange={onChange} error={errors.country?.message} />
            )} />
            <Controller control={control} name="city" render={({ field: { onChange, value } }) => (
              <Field label="City (optional)" placeholder="New York" value={value} onChangeText={onChange} />
            )} />
          </Section>

          <Section title="Account">
            <Controller control={control} name="username" render={({ field: { onChange, value } }) => (
              <Field label="Username" placeholder="janedoe" autoCapitalize="none" autoCorrect={false} autoComplete="username-new" value={value} onChangeText={onChange} error={errors.username?.message} />
            )} />
            <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
              <Field label="Password" placeholder="At least 8 characters" secureTextEntry autoComplete="password-new" value={value} onChangeText={onChange} error={errors.password?.message} />
            )} />
            <Controller control={control} name="confirmPassword" render={({ field: { onChange, value } }) => (
              <Field label="Confirm password" placeholder="Re-enter password" secureTextEntry value={value} onChangeText={onChange} error={errors.confirmPassword?.message} />
            )} />
          </Section>

          <Section title="Payouts & referral">
            <Controller control={control} name="paymentMethod" render={({ field: { onChange, value } }) => (
              <Select label="Preferred payout method" placeholder="Select a method" options={PAYMENT_METHODS} value={value} onChange={onChange} error={errors.paymentMethod?.message} />
            )} />
            <Controller control={control} name="socialHandle" render={({ field: { onChange, value } }) => (
              <Field label="Social handle (optional)" placeholder="@yourhandle" autoCapitalize="none" value={value} onChangeText={onChange} />
            )} />
            <Controller control={control} name="referralCode" render={({ field: { onChange, value } }) => (
              <Field label="Referral code (optional)" placeholder="Filled automatically from invite links" autoCapitalize="characters" value={value} onChangeText={onChange} />
            )} />
          </Section>

          {error ? <View style={{ marginTop: spacing.lg }}><Notice tone="danger" icon="alert-circle-outline" message={error} /></View> : null}

          <Button title="Submit application" iconRight="arrow-forward" size="lg" onPress={handleSubmit(onSubmit)} loading={loading} style={{ marginTop: spacing.xl }} />

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.lg }}>
            <T variant="small">Already approved?</T>
            <TextLink title="Sign in" onPress={() => router.replace('/(auth)/login')} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
