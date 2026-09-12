import React, { useState } from 'react'
import { View, Pressable, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme, radius, spacing, family } from '@/theme'

/**
 * Collapsible "create" panel used across admin screens. The caller renders
 * its own fields + submit button inside `children`.
 */
export function NewItemForm({ label = 'New', children, defaultOpen = false }: { label?: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const { c } = useTheme()
  const [open, setOpen] = useState(defaultOpen)
  const text = label.replace(/^\+\s*/, '')
  return (
    <View style={{ backgroundColor: c.card, borderWidth: 1, borderColor: open ? c.primaryLine : c.border, borderRadius: radius.lg, marginBottom: spacing.lg, overflow: 'hidden' }}>
      <Pressable onPress={() => setOpen((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: open }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 }}>
        <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={open ? 'remove' : 'add'} size={18} color={c.primaryFg} />
        </View>
        <Text style={{ flex: 1, color: c.ink, fontFamily: family.bodySemi, fontSize: 15 }}>{text}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={c.dim} />
      </Pressable>
      {open ? <View style={{ padding: 14, paddingTop: 4 }}>{children}</View> : null}
    </View>
  )
}
