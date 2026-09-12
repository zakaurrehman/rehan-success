import React, { useState } from 'react'
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert, Linking, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Screen, Field, Button, Logo, T, Notice, TextLink, useTheme, spacing } from '@/components/ui'
import { useAuth, PendingApprovalError } from '@/auth/AuthContext'
import { ApiError } from '@/api/client'
import { SUPPORT_EMAIL } from '@/lib/site'
import { Ionicons } from '@expo/vector-icons'

const schema = z.object({
  username: z.string().min(1, 'Enter your username or email'),
  password: z.string().min(1, 'Enter your password'),
})
type FormData = z.infer<typeof schema>

export default function LoginScreen() {
  const { signIn } = useAuth()
  const { c } = useTheme()
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  async function onSubmit(data: FormData) {
    setError('')
    setLoading(true)
    try {
      await signIn(data.username.trim(), data.password)
      // Root navigator handles role-based redirect.
    } catch (e) {
      if (e instanceof PendingApprovalError) {
        router.replace('/(auth)/pending')
        return
      }
      if (e instanceof ApiError) {
        if (e.status === 401) setError('That username/email and password don’t match.')
        else if (e.status === 429) setError('Too many attempts. Please wait a minute and try again.')
        else if (e.status === 404 || e.status === 0) setError('We can’t reach the server. Check your connection.')
        else setError(e.message || 'Sign in failed')
      } else {
        setError('We can’t reach the server. Check your connection.')
      }
    } finally {
      setLoading(false)
    }
  }

  function forgotPassword() {
    Alert.alert(
      'Reset your password',
      `For your security, password resets are handled by our support team. Email ${SUPPORT_EMAIL} from the address on your account.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Email support', onPress: () => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Password%20reset%20request`).catch(() => {}) },
      ]
    )
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: spacing.xl }} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/landing'))} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back"
            style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: c.card, borderWidth: 1, borderColor: c.border }}>
            <Ionicons name="chevron-back" size={20} color={c.ink} />
          </Pressable>

          <View style={{ flex: 1, justifyContent: 'center', paddingVertical: spacing.xxl }}>
            <Logo size={40} />
            <T variant="display" style={{ marginTop: spacing.xxl }}>Welcome back</T>
            <T variant="body" color={c.muted} style={{ marginTop: 6, marginBottom: spacing.xl }}>Sign in to your trading workspace.</T>

            <Controller control={control} name="username" render={({ field: { onChange, value } }) => (
              <Field label="Username or email" icon="person-outline" placeholder="you@example.com" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="username" autoComplete="username" returnKeyType="next" value={value} onChangeText={onChange} error={errors.username?.message} />
            )} />
            <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
              <Field label="Password" icon="lock-closed-outline" placeholder="Your password" secureTextEntry autoCapitalize="none" autoCorrect={false} textContentType="password" autoComplete="password" returnKeyType="go" onSubmitEditing={handleSubmit(onSubmit)} value={value} onChangeText={onChange} error={errors.password?.message} />
            )} />

            <View style={{ alignItems: 'flex-end', marginTop: -4, marginBottom: spacing.lg }}>
              <TextLink title="Forgot password?" onPress={forgotPassword} />
            </View>

            {error ? <View style={{ marginBottom: spacing.md }}><Notice tone="danger" icon="alert-circle-outline" message={error} /></View> : null}

            <Button title="Sign in" size="lg" onPress={handleSubmit(onSubmit)} loading={loading} />

            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: spacing.xl }}>
              <T variant="small">Want to earn commissions?</T>
              <TextLink title="Apply as affiliate" onPress={() => router.push('/(auth)/register')} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
