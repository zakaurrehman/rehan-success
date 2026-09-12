import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { StyleSheet, useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Rehan Success design tokens — mirrors the web "Verdant Ink" system.
 * Deep-teal primary, ink surfaces, champagne-gold accent; full light + dark.
 */
const light = {
  bg: '#f5f7fa',
  bg2: '#eef1f5',
  card: '#ffffff',
  card2: '#f3f5f8',
  card3: '#e9edf2',
  border: '#e3e8ee',
  borderStrong: '#cbd3dd',

  ink: '#0b1121',
  text: '#1f2937',
  muted: '#5e6b7e',
  dim: '#7b8898',
  faint: '#a9b3c1',

  primary: '#0f766e',
  primaryHover: '#0b5f58',
  primaryBright: '#14b8a6',
  primaryFg: '#ffffff',
  primaryTint: 'rgba(15,118,110,0.08)',
  primaryTint2: 'rgba(15,118,110,0.14)',
  primaryLine: 'rgba(15,118,110,0.26)',

  gold: '#b8901f',
  goldText: '#8a6a12',
  goldTint: 'rgba(184,144,31,0.12)',
  goldLine: 'rgba(184,144,31,0.32)',

  success: '#16a34a',
  successText: '#15803d',
  successTint: 'rgba(22,163,74,0.10)',
  successLine: 'rgba(22,163,74,0.28)',
  danger: '#dc2626',
  dangerText: '#b91c1c',
  dangerTint: 'rgba(220,38,38,0.09)',
  dangerLine: 'rgba(220,38,38,0.28)',
  warning: '#f59e0b',
  warningText: '#b45309',
  warningTint: 'rgba(245,158,11,0.12)',
  warningLine: 'rgba(245,158,11,0.34)',

  overlay: 'rgba(11,17,33,0.48)',
  white: '#ffffff',
  black: '#000000',
  shadow: '#0b1121',
}

export type Palette = typeof light

const dark: Palette = {
  bg: '#0b1020',
  bg2: '#0e1426',
  card: '#121a2b',
  card2: '#182234',
  card3: '#1f2a3f',
  border: 'rgba(148,163,184,0.14)',
  borderStrong: 'rgba(148,163,184,0.28)',

  ink: '#eef2f7',
  text: '#d7dee8',
  muted: '#a3adbe',
  dim: '#7c8797',
  faint: '#5b6677',

  primary: '#2dd4bf',
  primaryHover: '#5eead4',
  primaryBright: '#2dd4bf',
  primaryFg: '#0b1020',
  primaryTint: 'rgba(45,212,191,0.10)',
  primaryTint2: 'rgba(45,212,191,0.18)',
  primaryLine: 'rgba(45,212,191,0.32)',

  gold: '#e3c063',
  goldText: '#e3c063',
  goldTint: 'rgba(227,192,99,0.12)',
  goldLine: 'rgba(227,192,99,0.32)',

  success: '#22c55e',
  successText: '#4ade80',
  successTint: 'rgba(34,197,94,0.12)',
  successLine: 'rgba(34,197,94,0.30)',
  danger: '#ef4444',
  dangerText: '#f87171',
  dangerTint: 'rgba(239,68,68,0.12)',
  dangerLine: 'rgba(239,68,68,0.32)',
  warning: '#f59e0b',
  warningText: '#fbbf24',
  warningTint: 'rgba(245,158,11,0.12)',
  warningLine: 'rgba(245,158,11,0.34)',

  overlay: 'rgba(2,6,16,0.66)',
  white: '#ffffff',
  black: '#000000',
  shadow: '#000000',
}

export const palettes = { light, dark }

export const radius = { xs: 6, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, pill: 999 } as const
export const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 36 } as const

export const font = {
  display: 30,
  h1: 24,
  h2: 20,
  h3: 17,
  body: 15,
  small: 13,
  tiny: 12,
  micro: 11,
} as const

/**
 * Loaded in app/_layout.tsx. When using a custom family do NOT also set
 * fontWeight — Android falls back to the system font if both are set.
 */
export const family = {
  body: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemi: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
  display: 'Manrope_700Bold',
  displayHeavy: 'Manrope_800ExtraBold',
  mono: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_600SemiBold',
} as const

export function shadows(c: Palette, isDark: boolean) {
  return {
    xs: { shadowColor: c.shadow, shadowOpacity: isDark ? 0.3 : 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
    sm: { shadowColor: c.shadow, shadowOpacity: isDark ? 0.4 : 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
    md: { shadowColor: c.shadow, shadowOpacity: isDark ? 0.5 : 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
    primary: { shadowColor: isDark ? '#000' : c.primary, shadowOpacity: isDark ? 0.4 : 0.32, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  }
}

/** Plan badge tones. */
export function planTone(plan: string, c: Palette): { bg: string; color: string } {
  if (plan === 'FREE') return { bg: c.card3, color: c.muted }
  return { bg: c.goldTint, color: c.goldText }
}

/* ───────────────────────── Theme provider ───────────────────────── */

export type ThemePref = 'system' | 'light' | 'dark'
const PREF_KEY = 'rs_theme_pref'

type ThemeValue = {
  c: Palette
  isDark: boolean
  pref: ThemePref
  setPref: (p: ThemePref) => void
  shadow: ReturnType<typeof shadows>
}

const ThemeContext = createContext<ThemeValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme()
  const [pref, setPrefState] = useState<ThemePref>('system')

  useEffect(() => {
    AsyncStorage.getItem(PREF_KEY)
      .then((v) => { if (v === 'light' || v === 'dark' || v === 'system') setPrefState(v) })
      .catch(() => {})
  }, [])

  const setPref = useCallback((p: ThemePref) => {
    setPrefState(p)
    AsyncStorage.setItem(PREF_KEY, p).catch(() => {})
  }, [])

  const isDark = pref === 'system' ? system === 'dark' : pref === 'dark'
  const value = useMemo<ThemeValue>(() => {
    const c = isDark ? dark : light
    return { c, isDark, pref, setPref, shadow: shadows(c, isDark) }
  }, [isDark, pref, setPref])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}

/**
 * Theme-aware StyleSheet factory:
 *   const useStyles = makeStyles((c, t) => ({ card: { backgroundColor: c.card } }))
 *   const s = useStyles()
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (c: Palette, t: ThemeValue) => T) {
  const cache = new WeakMap<Palette, T>()
  return function useStyles(): T {
    const t = useTheme()
    let styles = cache.get(t.c)
    if (!styles) {
      styles = StyleSheet.create(factory(t.c, t))
      cache.set(t.c, styles)
    }
    return styles
  }
}
