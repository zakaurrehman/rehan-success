import { Stack } from 'expo-router'
import { useTheme, family } from '@/theme'

export default function AppLayout() {
  const { c } = useTheme()
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.bg },
        headerTintColor: c.ink,
        headerTitleStyle: { color: c.ink, fontFamily: family.display, fontSize: 17 },
        contentStyle: { backgroundColor: c.bg },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="research/[id]" options={{ title: '' }} />
      <Stack.Screen name="community/[id]" options={{ title: 'Discussion' }} />
      <Stack.Screen name="community/new" options={{ title: 'New post', presentation: 'modal' }} />
      <Stack.Screen name="classroom/[courseId]" options={{ title: 'Course' }} />
      <Stack.Screen name="signals-history" options={{ title: 'Signal history' }} />
      <Stack.Screen name="live" options={{ title: 'Live sessions' }} />
      <Stack.Screen name="calendar" options={{ title: 'Economic calendar' }} />
      <Stack.Screen name="brokers" options={{ title: 'Brokers' }} />
      <Stack.Screen name="resources" options={{ title: 'Resources' }} />
      <Stack.Screen name="watchlist" options={{ title: 'Markets' }} />
      <Stack.Screen name="calculator" options={{ title: 'Risk calculator' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="reviews" options={{ title: 'Reviews' }} />
      <Stack.Screen name="order" options={{ title: 'Plans' }} />
      <Stack.Screen name="affiliate/index" options={{ title: 'Affiliate' }} />
      <Stack.Screen name="affiliate/withdraw" options={{ title: 'Withdraw' }} />
      <Stack.Screen name="affiliate/commissions" options={{ title: 'Commissions' }} />
    </Stack>
  )
}
