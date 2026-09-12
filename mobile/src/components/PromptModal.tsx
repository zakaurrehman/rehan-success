import React, { useEffect, useState } from 'react'
import { Modal, View, Pressable, KeyboardAvoidingView, Platform } from 'react-native'
import { useTheme, radius, spacing } from '@/theme'
import { T, Field, Button } from '@/components/ui'
import type { TextInputProps } from 'react-native'

/** Cross-platform text prompt (Alert.prompt is iOS-only). */
export function PromptModal({
  visible,
  title,
  message,
  label,
  placeholder,
  initialValue = '',
  confirmLabel = 'Save',
  destructive,
  keyboardType,
  required,
  onCancel,
  onSubmit,
}: {
  visible: boolean
  title: string
  message?: string
  label?: string
  placeholder?: string
  initialValue?: string
  confirmLabel?: string
  destructive?: boolean
  keyboardType?: TextInputProps['keyboardType']
  required?: boolean
  onCancel: () => void
  onSubmit: (value: string) => void
}) {
  const { c } = useTheme()
  const [value, setValue] = useState(initialValue)
  useEffect(() => { if (visible) setValue(initialValue) }, [visible, initialValue])

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable style={{ flex: 1, backgroundColor: c.overlay, justifyContent: 'center', padding: spacing.xl }} onPress={onCancel}>
          <Pressable onPress={() => {}} style={{ backgroundColor: c.card, borderRadius: radius.xl, padding: spacing.xl, borderWidth: 1, borderColor: c.border }}>
            <T variant="h3">{title}</T>
            {message ? <T variant="small" style={{ marginTop: 4 }}>{message}</T> : null}
            <View style={{ marginTop: spacing.lg }}>
              <Field label={label} placeholder={placeholder} value={value} onChangeText={setValue} keyboardType={keyboardType} autoFocus />
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button title="Cancel" variant="secondary" style={{ flex: 1 }} onPress={onCancel} />
              <Button title={confirmLabel} variant={destructive ? 'danger' : 'primary'} style={{ flex: 1 }} disabled={required && !value.trim()} onPress={() => onSubmit(value)} />
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  )
}
