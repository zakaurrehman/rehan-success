import React from 'react'
import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Screen, Button, T, useTheme, spacing } from '@/components/ui'

export default function PendingScreen() {
  const router = useRouter()
  const { c } = useTheme()
  return (
    <Screen edges={['top', 'bottom']} padded contentStyle={{ justifyContent: 'center' }}>
      <View style={{ alignItems: 'center' }}>
        <View style={{ width: 76, height: 76, borderRadius: 24, backgroundColor: c.warningTint, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="hourglass-outline" size={38} color={c.warningText} />
        </View>
        <T variant="h1" style={{ marginTop: spacing.xl, textAlign: 'center' }}>Awaiting approval</T>
        <T variant="body" color={c.muted} style={{ marginTop: 10, textAlign: 'center', lineHeight: 23, marginBottom: spacing.xxl }}>
          Your account has been created and is being reviewed by the Rehan Success team. You’ll be able to sign in as soon as it’s approved.
        </T>
      </View>
      <Button title="Back to sign in" variant="secondary" icon="arrow-back" size="lg" onPress={() => router.replace('/(auth)/login')} />
    </Screen>
  )
}
