import React, { useState } from 'react'
import { View, Text, Pressable, Modal, FlatList } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme, radius, spacing, family } from '@/theme'
import { T } from '@/components/ui'

/** Bottom-sheet picker — the native-feeling replacement for <select>. */
export function Select({
  label,
  value,
  options,
  placeholder = 'Select…',
  onChange,
  error,
}: {
  label?: string
  value: string
  options: string[] | { label: string; value: string }[]
  placeholder?: string
  onChange: (v: string) => void
  error?: string
}) {
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const [open, setOpen] = useState(false)
  const norm = options.map((o) => (typeof o === 'string' ? { label: o, value: o } : o))
  const selected = norm.find((o) => o.value === value)

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <T variant="label" style={{ marginBottom: 6 }}>{label}</T> : null}
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label || 'Select'}: ${selected ? selected.label : placeholder}`}
        style={{ minHeight: 50, backgroundColor: c.card, borderWidth: 1, borderColor: error ? c.danger : c.borderStrong, borderRadius: radius.md, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Text style={{ color: selected ? c.ink : c.dim, fontFamily: family.body, fontSize: 15, flex: 1 }} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={c.dim} />
      </Pressable>
      {error ? <T variant="tiny" color={c.dangerText} style={{ marginTop: 5 }}>{error}</T> : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)} statusBarTranslucent>
        <Pressable style={{ flex: 1, backgroundColor: c.overlay, justifyContent: 'flex-end' }} onPress={() => setOpen(false)}>
          <Pressable style={{ backgroundColor: c.card, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, maxHeight: '72%', paddingBottom: Math.max(insets.bottom, 12) }} onPress={() => {}}>
            <View style={{ alignItems: 'center', paddingTop: 10 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.borderStrong }} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
              <T variant="h3">{label || 'Select'}</T>
              <Pressable onPress={() => setOpen(false)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close">
                <Ionicons name="close" size={22} color={c.muted} />
              </Pressable>
            </View>
            <FlatList
              data={norm}
              keyExtractor={(i) => i.value}
              initialNumToRender={20}
              renderItem={({ item }) => {
                const on = item.value === value
                return (
                  <Pressable
                    onPress={() => { onChange(item.value); setOpen(false) }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, minHeight: 52, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: pressed ? c.card2 : on ? c.primaryTint : 'transparent' })}
                  >
                    <Text style={{ color: on ? c.primary : c.text, fontSize: 15, fontFamily: on ? family.bodySemi : family.body }}>{item.label}</Text>
                    {on ? <Ionicons name="checkmark" size={20} color={c.primary} /> : null}
                  </Pressable>
                )
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}
