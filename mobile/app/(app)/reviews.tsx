import React, { useState } from 'react'
import { View, Pressable, KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useApi } from '@/api/hooks'
import { apiFetch } from '@/api/client'
import { useAuth } from '@/auth/AuthContext'
import { Field, Button, Card, T, Avatar, Notice, SectionTitle, Loader, useTheme, spacing, radius } from '@/components/ui'
import { timeAgo } from '@/lib/format'
import type { Review } from '@/types'

const schema = z.object({
  clientName: z.string().min(2, 'Your name is required'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  rating: z.number().min(1).max(5),
  content: z.string().min(10, 'Tell us a little more (10+ characters)'),
})
type FormData = z.infer<typeof schema>

function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const { c } = useTheme()
  return (
    <View style={{ flexDirection: 'row', gap: 6 }} accessibilityRole="adjustable" accessibilityLabel={`Rating ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => onChange(n)} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`}>
          <Ionicons name={n <= value ? 'star' : 'star-outline'} size={32} color={n <= value ? c.gold : c.faint} />
        </Pressable>
      ))}
    </View>
  )
}

export default function ReviewsScreen() {
  const qc = useQueryClient()
  const { user } = useAuth()
  const { c } = useTheme()
  const { data, isLoading } = useApi<Review[]>('/api/reviews')
  const [success, setSuccess] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { clientName: user?.fullName ?? '', email: user?.email ?? '', rating: 5, content: '' },
  })

  async function onSubmit(d: FormData) {
    setBusy(true)
    setError('')
    try {
      await apiFetch('/api/reviews', { method: 'POST', body: { clientName: d.clientName, email: d.email || null, rating: d.rating, content: d.content }, auth: false })
      qc.invalidateQueries({ queryKey: ['/api/reviews'] })
      setSuccess(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit your review')
    } finally {
      setBusy(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {success ? (
          <Notice tone="success" icon="checkmark-circle" message="Thank you! Your review was submitted and will appear once approved." />
        ) : (
          <Card>
            <T variant="h3">Leave a review</T>
            <T variant="small" style={{ marginTop: 2, marginBottom: spacing.lg }}>Reviews are moderated before they’re published.</T>
            <T variant="label" style={{ marginBottom: 8 }}>Rating</T>
            <Controller control={control} name="rating" render={({ field: { onChange, value } }) => (
              <View style={{ marginBottom: spacing.lg }}><Stars value={value} onChange={onChange} /></View>
            )} />
            <Controller control={control} name="clientName" render={({ field: { onChange, value } }) => (
              <Field label="Your name" placeholder="Jane D." value={value} onChangeText={onChange} error={errors.clientName?.message} />
            )} />
            <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
              <Field label="Email (optional)" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" value={value} onChangeText={onChange} error={errors.email?.message} />
            )} />
            <Controller control={control} name="content" render={({ field: { onChange, value } }) => (
              <Field label="Your review" placeholder="What has your experience been like?" multiline numberOfLines={5} style={{ minHeight: 120 }} value={value} onChangeText={onChange} error={errors.content?.message} />
            )} />
            {error ? <View style={{ marginBottom: spacing.md }}><Notice tone="danger" message={error} icon="alert-circle-outline" /></View> : null}
            <Button title="Submit review" icon="send" onPress={handleSubmit(onSubmit)} loading={busy} />
          </Card>
        )}

        <SectionTitle>What members are saying</SectionTitle>
        {isLoading ? <Loader /> : (data ?? []).length === 0 ? (
          <T variant="small" style={{ textAlign: 'center', padding: 24 }}>No reviews yet.</T>
        ) : (
          (data ?? []).map((r) => (
            <View key={r.id} style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: radius.lg, padding: 14, marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Avatar name={r.clientName} size={32} />
                <T variant="smallStrong" style={{ flex: 1 }}>{r.clientName}</T>
                <T variant="tiny">{timeAgo(r.createdAt)}</T>
              </View>
              <Text style={{ color: c.gold, marginTop: 8, letterSpacing: 2 }}>{'★'.repeat(r.rating)}</Text>
              <T variant="small" color={c.text} style={{ marginTop: 4 }}>{r.content}</T>
            </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
