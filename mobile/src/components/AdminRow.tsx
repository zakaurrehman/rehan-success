import React from 'react'
import { View } from 'react-native'
import { useTheme, radius, spacing } from '@/theme'
import { T } from '@/components/ui'

/** Shared list-row container for admin module screens. */
export function AdminRow({ title, subtitle, badge, children }: { title: string; subtitle?: string; badge?: React.ReactNode; children?: React.ReactNode }) {
  const { c, shadow } = useTheme()
  return (
    <View style={[{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: radius.lg, padding: 14, marginBottom: 10 }, shadow.xs]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <T variant="bodyStrong">{title}</T>
          {subtitle ? <T variant="small" style={{ marginTop: 3 }}>{subtitle}</T> : null}
        </View>
        {badge}
      </View>
      {children ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: c.border }}>{children}</View> : null}
    </View>
  )
}
