import React, { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiFetch } from '@/api/client'
import { Field, Button, Notice, T, useTheme, spacing } from '@/components/ui'

const schema = z.object({
  title: z.string().min(3, 'Add a short title'),
  content: z.string().min(5, 'Write something to share'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>

export default function NewPostScreen() {
  const router = useRouter()
  const qc = useQueryClient()
  const { c } = useTheme()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { title: '', content: '', imageUrl: '' } })

  async function onSubmit(data: FormData) {
    setBusy(true)
    setError('')
    try {
      await apiFetch('/api/community', { method: 'POST', body: { title: data.title, content: data.content, imageUrl: data.imageUrl || undefined } })
      qc.invalidateQueries({ queryKey: ['/api/community'] })
      router.back()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not publish')
    } finally {
      setBusy(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled">
        <T variant="small" style={{ marginBottom: spacing.lg }}>Share a chart idea, a market view or a question with the community.</T>
        <Controller control={control} name="title" render={({ field: { onChange, value } }) => (
          <Field label="Title" placeholder="e.g. EUR/USD H4 outlook" value={value} onChangeText={onChange} error={errors.title?.message} maxLength={140} />
        )} />
        <Controller control={control} name="content" render={({ field: { onChange, value } }) => (
          <Field label="Post" placeholder="What are you seeing in the market?" value={value} onChangeText={onChange} multiline numberOfLines={7} style={{ minHeight: 160 }} error={errors.content?.message} />
        )} />
        <Controller control={control} name="imageUrl" render={({ field: { onChange, value } }) => (
          <Field label="Chart image URL (optional)" placeholder="https://…" autoCapitalize="none" keyboardType="url" value={value} onChangeText={onChange} error={errors.imageUrl?.message} />
        )} />
        {error ? <View style={{ marginBottom: spacing.md }}><Notice tone="danger" icon="alert-circle-outline" message={error} /></View> : null}
        <Button title="Publish post" icon="send" size="lg" onPress={handleSubmit(onSubmit)} loading={busy} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
