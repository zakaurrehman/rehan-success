import 'react-native-gesture-handler'
import React, { useEffect } from 'react'
import { View } from 'react-native'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { QueryClientProvider } from '@tanstack/react-query'
import * as Linking from 'expo-linking'
import * as Notifications from 'expo-notifications'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'
import { Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope'
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans'
import { JetBrainsMono_500Medium, JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono'
import { queryClient } from '@/api/queryClient'
import { AuthProvider, useAuth } from '@/auth/AuthContext'
import { ThemeProvider, useTheme } from '@/theme'
import { registerForPush } from '@/lib/push'
import { parseRefCode, saveRefCode } from '@/lib/refcode'
import { LogoMark } from '@/components/ui'

// Keep the native splash visible while fonts load.
SplashScreen.preventAutoHideAsync().catch(() => {})

function RootNavigator() {
  const { user, bootstrapping } = useAuth()
  const { c, isDark } = useTheme()
  const segments = useSegments()
  const router = useRouter()

  // Role-based routing.
  useEffect(() => {
    if (bootstrapping) return
    const group = segments[0]
    const inAuth = group === '(auth)'

    if (!user && !inAuth) {
      router.replace('/(auth)/landing')
    } else if (user && inAuth) {
      router.replace(user.role === 'ADMIN' ? '/(admin)' : '/(app)/(tabs)/signals')
    } else if (user && user.role === 'ADMIN' && group === '(app)') {
      router.replace('/(admin)')
    } else if (user && user.role !== 'ADMIN' && group === '(admin)') {
      router.replace('/(app)/(tabs)/signals')
    }
  }, [user, bootstrapping, segments, router])

  // Register for push + route on notification tap.
  useEffect(() => {
    if (!user) return
    registerForPush()
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { link?: string }
      if (data?.link && typeof data.link === 'string') {
        const path = data.link.startsWith('/') ? data.link : `/${data.link}`
        router.push(path as never)
      }
    })
    return () => sub.remove()
  }, [user, router])

  // Capture affiliate referral deep links (rehansuccess://ref/CODE).
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) {
        const code = parseRefCode(url)
        if (code) saveRefCode(code)
      }
    })
    const sub = Linking.addEventListener('url', ({ url }) => {
      const code = parseRefCode(url)
      if (code) saveRefCode(code)
    })
    return () => sub.remove()
  }, [])

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {bootstrapping ? (
        <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
          <LogoMark size={64} />
        </View>
      ) : (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="(admin)" />
        </Stack>
      )}
    </>
  )
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_700Bold,
    Manrope_800ExtraBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {})
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <RootNavigator />
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
