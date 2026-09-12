import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  type TextInputProps,
  type ViewStyle,
  type StyleProp,
  type TextStyle,
} from 'react-native'
import { SafeAreaView, type Edge } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { makeStyles, useTheme, radius, spacing, font, family, planTone, type Palette } from '@/theme'

export type IconName = keyof typeof Ionicons.glyphMap
export type Tone = 'neutral' | 'primary' | 'success' | 'danger' | 'warning' | 'gold'

export function toneColors(c: Palette, tone: Tone) {
  switch (tone) {
    case 'primary': return { bg: c.primaryTint, fg: c.primary, line: c.primaryLine, solid: c.primary, solidFg: c.primaryFg }
    case 'success': return { bg: c.successTint, fg: c.successText, line: c.successLine, solid: c.success, solidFg: '#fff' }
    case 'danger': return { bg: c.dangerTint, fg: c.dangerText, line: c.dangerLine, solid: c.danger, solidFg: '#fff' }
    case 'warning': return { bg: c.warningTint, fg: c.warningText, line: c.warningLine, solid: c.warning, solidFg: '#1a1405' }
    case 'gold': return { bg: c.goldTint, fg: c.goldText, line: c.goldLine, solid: c.gold, solidFg: '#1a1405' }
    default: return { bg: c.card3, fg: c.muted, line: c.border, solid: c.muted, solidFg: '#fff' }
  }
}

/* ── Typography ───────────────────────────────────────────────────── */
type TVariant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodyStrong' | 'small' | 'smallStrong' | 'tiny' | 'label' | 'overline' | 'num' | 'numLg'

export function T({ variant = 'body', color, style, children, numberOfLines, ...rest }: { variant?: TVariant; color?: string; style?: StyleProp<TextStyle>; children: React.ReactNode; numberOfLines?: number; selectable?: boolean }) {
  const { c } = useTheme()
  const base: Record<TVariant, TextStyle> = {
    display: { fontFamily: family.displayHeavy, fontSize: font.display, lineHeight: 36, letterSpacing: -0.8, color: c.ink },
    h1: { fontFamily: family.displayHeavy, fontSize: font.h1, lineHeight: 30, letterSpacing: -0.5, color: c.ink },
    h2: { fontFamily: family.display, fontSize: font.h2, lineHeight: 26, letterSpacing: -0.3, color: c.ink },
    h3: { fontFamily: family.display, fontSize: font.h3, lineHeight: 22, letterSpacing: -0.2, color: c.ink },
    body: { fontFamily: family.body, fontSize: font.body, lineHeight: 22, color: c.text },
    bodyStrong: { fontFamily: family.bodySemi, fontSize: font.body, lineHeight: 22, color: c.ink },
    small: { fontFamily: family.body, fontSize: font.small, lineHeight: 19, color: c.muted },
    smallStrong: { fontFamily: family.bodySemi, fontSize: font.small, lineHeight: 19, color: c.ink },
    tiny: { fontFamily: family.body, fontSize: font.tiny, lineHeight: 16, color: c.dim },
    label: { fontFamily: family.bodySemi, fontSize: font.small, color: c.text },
    overline: { fontFamily: family.bodyBold, fontSize: font.micro, letterSpacing: 1.1, textTransform: 'uppercase', color: c.dim },
    num: { fontFamily: family.monoBold, fontSize: font.body, color: c.ink, letterSpacing: -0.2 },
    numLg: { fontFamily: family.monoBold, fontSize: 28, lineHeight: 34, color: c.ink, letterSpacing: -0.8 },
  }
  return (
    <Text style={[base[variant], color ? { color } : null, style]} numberOfLines={numberOfLines} {...rest}>
      {children}
    </Text>
  )
}

/* ── Screen ───────────────────────────────────────────────────────── */
export function Screen({
  children,
  scroll,
  refreshing,
  onRefresh,
  // Screens under a native header already get the top inset from it.
  edges = [],
  style,
  contentStyle,
  padded = false,
}: {
  children: React.ReactNode
  scroll?: boolean
  refreshing?: boolean
  onRefresh?: () => void
  edges?: Edge[]
  style?: StyleProp<ViewStyle>
  contentStyle?: StyleProp<ViewStyle>
  padded?: boolean
}) {
  const { c } = useTheme()
  const pad = padded ? { padding: spacing.lg } : null
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: c.bg }, style]} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[{ paddingBottom: 40 }, pad, contentStyle]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={c.primary} colors={[c.primary]} progressBackgroundColor={c.card} /> : undefined}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, pad, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  )
}

/** Large in-page header for tab screens. */
export function LargeHeader({ title, subtitle, right, eyebrow }: { title: string; subtitle?: string; right?: React.ReactNode; eyebrow?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md, gap: spacing.md }}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <T variant="small" style={{ marginBottom: 2 }}>{eyebrow}</T> : null}
        <T variant="h1">{title}</T>
        {subtitle ? <T variant="small" style={{ marginTop: 2 }}>{subtitle}</T> : null}
      </View>
      {right}
    </View>
  )
}

/* ── Card ─────────────────────────────────────────────────────────── */
const useCardStyles = makeStyles((c) => ({
  card: { backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: radius.lg, padding: spacing.lg },
  sub: { backgroundColor: c.card2, borderWidth: 1, borderColor: c.border, borderRadius: radius.md, padding: spacing.md },
}))

export function Card({ children, style, onPress, variant = 'default', accessibilityLabel }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; variant?: 'default' | 'sub'; accessibilityLabel?: string }) {
  const s = useCardStyles()
  const { shadow } = useTheme()
  const base = [variant === 'sub' ? s.sub : [s.card, shadow.xs], style]
  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={({ pressed }) => [base, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}>
        {children}
      </Pressable>
    )
  }
  return <View style={base}>{children}</View>
}

/* ── Button ───────────────────────────────────────────────────────── */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dangerSoft' | 'success' | 'successSoft' | 'gold'

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  icon,
  iconRight,
  style,
  block = true,
  accessibilityLabel,
}: {
  title: string
  onPress?: () => void
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: IconName
  iconRight?: IconName
  style?: StyleProp<ViewStyle>
  block?: boolean
  accessibilityLabel?: string
}) {
  const { c, shadow } = useTheme()
  const isDisabled = disabled || loading
  const map: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: c.primary, fg: c.primaryFg },
    secondary: { bg: c.card, fg: c.ink, border: c.borderStrong },
    outline: { bg: 'transparent', fg: c.primary, border: c.primaryLine },
    ghost: { bg: 'transparent', fg: c.muted },
    danger: { bg: c.danger, fg: '#fff' },
    dangerSoft: { bg: c.dangerTint, fg: c.dangerText, border: c.dangerLine },
    success: { bg: c.success, fg: '#fff' },
    successSoft: { bg: c.successTint, fg: c.successText, border: c.successLine },
    gold: { bg: c.gold, fg: '#1a1405' },
  }
  const v = map[variant]
  const h = size === 'sm' ? 36 : size === 'lg' ? 54 : 48
  const fs = size === 'sm' ? 13 : 15
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      hitSlop={size === 'sm' ? 6 : 0}
      style={({ pressed }) => [
        {
          minHeight: h,
          paddingHorizontal: size === 'sm' ? 12 : 18,
          borderRadius: size === 'sm' ? radius.sm : radius.md,
          backgroundColor: v.bg,
          borderWidth: v.border ? 1 : 0,
          borderColor: v.border,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: block ? 'stretch' : 'flex-start',
          opacity: isDisabled ? 0.5 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
        },
        variant === 'primary' && !isDisabled ? shadow.primary : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon ? <Ionicons name={icon} size={fs + 2} color={v.fg} /> : null}
          <Text style={{ color: v.fg, fontFamily: family.bodyBold, fontSize: fs }}>{title}</Text>
          {iconRight ? <Ionicons name={iconRight} size={fs + 2} color={v.fg} /> : null}
        </View>
      )}
    </Pressable>
  )
}

export function IconButton({ icon, onPress, badge, label, color, size = 22 }: { icon: IconName; onPress?: () => void; badge?: number; label: string; color?: string; size?: number }) {
  const { c } = useTheme()
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8}
      style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? c.card3 : c.card, borderWidth: 1, borderColor: c.border })}>
      <Ionicons name={icon} size={size} color={color || c.ink} />
      {badge ? (
        <View style={{ position: 'absolute', top: 6, right: 6, minWidth: 17, height: 17, paddingHorizontal: 4, borderRadius: 9, backgroundColor: c.danger, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: c.card }}>
          <Text style={{ color: '#fff', fontSize: 9, fontFamily: family.bodyBold }}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
    </Pressable>
  )
}

/* ── Form field ───────────────────────────────────────────────────── */
export function Field({ label, error, hint, icon, secureTextEntry, style, ...props }: TextInputProps & { label?: string; error?: string; hint?: string; icon?: IconName }) {
  const { c } = useTheme()
  const [focused, setFocused] = useState(false)
  const [hidden, setHidden] = useState(!!secureTextEntry)
  const multiline = !!props.multiline
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <T variant="label" style={{ marginBottom: 6 }}>{label}</T> : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          backgroundColor: c.card,
          borderWidth: 1,
          borderColor: error ? c.danger : focused ? c.primary : c.borderStrong,
          borderRadius: radius.md,
          paddingHorizontal: 14,
          minHeight: 50,
        }}
      >
        {icon ? <Ionicons name={icon} size={18} color={c.dim} style={{ marginRight: 8, marginTop: multiline ? 14 : 0 }} /> : null}
        <TextInput
          placeholderTextColor={c.dim}
          selectionColor={c.primary}
          secureTextEntry={hidden}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
          style={[{ flex: 1, color: c.ink, fontFamily: family.body, fontSize: 15, paddingVertical: 13 }, multiline && { textAlignVertical: 'top' }, style]}
          {...props}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} accessibilityRole="button" accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={c.dim} />
          </Pressable>
        ) : null}
      </View>
      {error ? <T variant="tiny" color={c.dangerText} style={{ marginTop: 5 }}>{error}</T> : hint ? <T variant="tiny" style={{ marginTop: 5 }}>{hint}</T> : null}
    </View>
  )
}

/* ── Pills & badges ───────────────────────────────────────────────── */
export function Badge({ label, tone = 'primary', solid, icon, color }: { label: string; tone?: Tone; solid?: boolean; icon?: IconName; color?: string }) {
  const { c } = useTheme()
  const t = toneColors(c, tone)
  const fg = color || (solid ? t.solidFg : t.fg)
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: solid ? t.solid : t.bg, borderWidth: solid ? 0 : 1, borderColor: t.line }}>
      {icon ? <Ionicons name={icon} size={11} color={fg} /> : null}
      <Text style={{ color: fg, fontSize: 11, fontFamily: family.bodyBold, letterSpacing: 0.2 }}>{label}</Text>
    </View>
  )
}

export function PlanBadge({ plan }: { plan: string }) {
  const { c } = useTheme()
  const p = planTone(plan, c)
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: p.bg }}>
      <Ionicons name="ribbon-outline" size={12} color={p.color} />
      <Text style={{ color: p.color, fontSize: 11, fontFamily: family.bodyBold }}>{plan} PLAN</Text>
    </View>
  )
}

const STATUS_TONE: Record<string, Tone> = {
  ACTIVE: 'success', APPROVED: 'success', PAID: 'success', CONFIRMED: 'success', PUBLISHED: 'success',
  PENDING: 'warning', SCHEDULED: 'primary', HIT_TP: 'primary', REJECTED: 'danger', HIT_SL: 'danger', LIVE: 'danger',
  CLOSED: 'neutral', HIDDEN: 'neutral',
}
const STATUS_LABEL: Record<string, string> = { HIT_TP: 'TP hit', HIT_SL: 'SL hit' }
export function StatusPill({ status }: { status: string }) {
  return <Badge label={STATUS_LABEL[status] ?? status.charAt(0) + status.slice(1).toLowerCase()} tone={STATUS_TONE[status] ?? 'neutral'} />
}

export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress?: () => void; icon?: IconName }) {
  const { c } = useTheme()
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: !!active }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: 36, borderRadius: radius.pill, backgroundColor: active ? c.primary : c.card, borderWidth: 1, borderColor: active ? c.primary : c.border }}>
      {icon ? <Ionicons name={icon} size={14} color={active ? c.primaryFg : c.muted} /> : null}
      <Text style={{ color: active ? c.primaryFg : c.muted, fontFamily: family.bodySemi, fontSize: 13 }}>{label}</Text>
    </Pressable>
  )
}

export function Segmented<K extends string>({ value, options, onChange }: { value: K; options: { key: K; label: string }[]; onChange: (k: K) => void }) {
  const { c } = useTheme()
  return (
    <View style={{ flexDirection: 'row', backgroundColor: c.card3, borderRadius: radius.md, padding: 3 }} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.key === value
        return (
          <Pressable key={o.key} onPress={() => onChange(o.key)} accessibilityRole="tab" accessibilityState={{ selected: active }}
            style={{ flex: 1, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? c.card : 'transparent' }}>
            <Text style={{ fontFamily: family.bodySemi, fontSize: 13, color: active ? c.ink : c.muted }}>{o.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

/* ── States ───────────────────────────────────────────────────────── */
export function Loader({ label }: { label?: string }) {
  const { c } = useTheme()
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10 }}>
      <ActivityIndicator color={c.primary} size="large" />
      {label ? <T variant="small">{label}</T> : null}
    </View>
  )
}

export function Skeleton({ height = 80, style }: { height?: number; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme()
  return <View style={[{ height, borderRadius: radius.lg, backgroundColor: c.card3, marginBottom: spacing.md }, style]} />
}

export function EmptyState({ icon = 'file-tray-outline', title, subtitle, action }: { icon?: IconName; title: string; subtitle?: string; action?: React.ReactNode }) {
  const { c } = useTheme()
  return (
    <View style={{ alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24, borderWidth: 1, borderStyle: 'dashed', borderColor: c.borderStrong, borderRadius: radius.lg }}>
      <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: c.card2, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={24} color={c.dim} />
      </View>
      <T variant="bodyStrong" style={{ marginTop: 14, textAlign: 'center' }}>{title}</T>
      {subtitle ? <T variant="small" style={{ marginTop: 4, textAlign: 'center' }}>{subtitle}</T> : null}
      {action ? <View style={{ marginTop: 16, alignSelf: 'stretch' }}>{action}</View> : null}
    </View>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { c } = useTheme()
  return (
    <View style={{ alignItems: 'center', padding: 36, gap: 6 }}>
      <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: c.dangerTint, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="cloud-offline-outline" size={24} color={c.dangerText} />
      </View>
      <T variant="bodyStrong" style={{ marginTop: 8, textAlign: 'center' }}>{message}</T>
      <T variant="small" style={{ textAlign: 'center' }}>Check your connection and try again.</T>
      {onRetry ? <Button title="Try again" variant="secondary" icon="refresh" onPress={onRetry} block={false} style={{ marginTop: 12 }} /> : null}
    </View>
  )
}

export function SectionTitle({ children, action, style }: { children: React.ReactNode; action?: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.sm }, style]}>
      <T variant="overline">{children}</T>
      {action}
    </View>
  )
}

export function TextLink({ title, onPress, icon }: { title: string; onPress: () => void; icon?: IconName }) {
  const { c } = useTheme()
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="link" style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      <Text style={{ color: c.primary, fontFamily: family.bodySemi, fontSize: 13 }}>{title}</Text>
      {icon ? <Ionicons name={icon} size={14} color={c.primary} /> : null}
    </Pressable>
  )
}

export function ProgressBar({ value, color, height = 6 }: { value: number; color?: string; height?: number }) {
  const { c } = useTheme()
  const pct = Math.max(0, Math.min(100, value))
  return (
    <View style={{ height, backgroundColor: c.card3, borderRadius: radius.pill, overflow: 'hidden' }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: pct }}>
      <View style={{ width: `${pct}%`, height, borderRadius: radius.pill, backgroundColor: color || (pct === 100 ? c.success : c.primary) }} />
    </View>
  )
}

export function LockBanner({ message, tone = 'gold' }: { message: string; tone?: Tone }) {
  const { c } = useTheme()
  const t = toneColors(c, tone)
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: t.bg, borderWidth: 1, borderColor: t.line, borderRadius: radius.md, padding: spacing.md }}>
      <Ionicons name="lock-closed" size={16} color={t.fg} />
      <Text style={{ color: t.fg, fontFamily: family.bodyMedium, fontSize: 13, flex: 1, lineHeight: 18 }}>{message}</Text>
    </View>
  )
}

export function Notice({ message, tone = 'primary', icon = 'information-circle-outline' }: { message: string; tone?: Tone; icon?: IconName }) {
  const { c } = useTheme()
  const t = toneColors(c, tone)
  return (
    <View style={{ flexDirection: 'row', gap: 10, backgroundColor: t.bg, borderWidth: 1, borderColor: t.line, borderRadius: radius.md, padding: spacing.md }}>
      <Ionicons name={icon} size={18} color={t.fg} />
      <Text style={{ color: t.fg, fontFamily: family.bodyMedium, fontSize: 13, flex: 1, lineHeight: 19 }}>{message}</Text>
    </View>
  )
}

export function RiskDisclaimer() {
  return (
    <T variant="tiny" style={{ paddingVertical: spacing.lg, lineHeight: 17 }}>
      Risk warning: trading Forex and CFDs carries a high level of risk and may not be suitable for all investors. Past performance does not guarantee future results. Educational content only — not financial advice.
    </T>
  )
}

export function StatTile({ label, value, tone = 'neutral', icon, hint, onPress, style }: { label: string; value: string; tone?: Tone; icon?: IconName; hint?: string; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme()
  const t = toneColors(c, tone)
  return (
    <Card onPress={onPress} style={[{ flex: 1, padding: 14 }, style]} accessibilityLabel={`${label} ${value}`}>
      {icon ? (
        <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
          <Ionicons name={icon} size={16} color={t.fg} />
        </View>
      ) : null}
      <T variant="tiny">{label}</T>
      <T variant="num" style={{ fontSize: 19, marginTop: 2 }} color={tone === 'neutral' ? c.ink : t.fg} numberOfLines={1}>{value}</T>
      {hint ? <T variant="tiny" style={{ marginTop: 2 }} numberOfLines={1}>{hint}</T> : null}
    </Card>
  )
}

export function ListRow({ icon, title, subtitle, right, onPress, tone = 'neutral', last, destructive }: { icon?: IconName; title: string; subtitle?: string; right?: React.ReactNode; onPress?: () => void; tone?: Tone; last?: boolean; destructive?: boolean }) {
  const { c } = useTheme()
  const t = toneColors(c, tone)
  return (
    <Pressable onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: spacing.lg, backgroundColor: pressed ? c.card2 : 'transparent', borderBottomWidth: last ? 0 : 1, borderBottomColor: c.border })}>
      {icon ? (
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: destructive ? c.dangerTint : t.bg, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={18} color={destructive ? c.dangerText : t.fg} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <T variant="bodyStrong" color={destructive ? c.dangerText : undefined} numberOfLines={1}>{title}</T>
        {subtitle ? <T variant="tiny" numberOfLines={2}>{subtitle}</T> : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={c.faint} /> : null)}
    </Pressable>
  )
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const { c } = useTheme()
  const initials = name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?'
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c.primaryTint2, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: c.primary, fontFamily: family.bodyBold, fontSize: Math.round(size * 0.38) }}>{initials}</Text>
    </View>
  )
}

/* ── Brand ────────────────────────────────────────────────────────── */
export function LogoMark({ size = 36 }: { size?: number }) {
  const u = size / 48
  return (
    <View style={{ width: size, height: size, borderRadius: 13 * u, backgroundColor: '#0f766e', overflow: 'hidden' }} accessibilityLabel="Rehan Success">
      <View style={{ position: 'absolute', left: 10.5 * u, top: 27 * u, width: 6.5 * u, height: 11 * u, borderRadius: 2.2 * u, backgroundColor: 'rgba(255,255,255,0.62)' }} />
      <View style={{ position: 'absolute', left: 20.75 * u, top: 20.5 * u, width: 6.5 * u, height: 17.5 * u, borderRadius: 2.2 * u, backgroundColor: 'rgba(255,255,255,0.82)' }} />
      <View style={{ position: 'absolute', left: 31 * u, top: 15 * u, width: 6.5 * u, height: 23 * u, borderRadius: 2.2 * u, backgroundColor: '#ffffff' }} />
      <View style={{ position: 'absolute', left: 28.9 * u, top: 6.5 * u, width: 0, height: 0, borderLeftWidth: 5.35 * u, borderRightWidth: 5.35 * u, borderBottomWidth: 5.9 * u, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#e3c063' }} />
    </View>
  )
}

export function Logo({ size = 34, onDark }: { size?: number; onDark?: boolean }) {
  const { c } = useTheme()
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <LogoMark size={size} />
      <Text style={{ fontSize: Math.round(size * 0.52), letterSpacing: -0.4 }}>
        <Text style={{ fontFamily: family.displayHeavy, color: onDark ? '#fff' : c.ink }}>Rehan</Text>
        <Text style={{ fontFamily: family.display, color: onDark ? '#5eead4' : c.primary }}> Success</Text>
      </Text>
    </View>
  )
}

export { radius, spacing, font, family, useTheme, makeStyles } from '@/theme'
