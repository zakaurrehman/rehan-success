import { Stack } from 'expo-router'
import { useTheme, family } from '@/theme'

export default function AdminLayout() {
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
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="users" options={{ title: 'Users' }} />
      <Stack.Screen name="signals" options={{ title: 'Signals' }} />
      <Stack.Screen name="research" options={{ title: 'Research' }} />
      <Stack.Screen name="courses" options={{ title: 'Courses' }} />
      <Stack.Screen name="sessions" options={{ title: 'Live sessions' }} />
      <Stack.Screen name="calendar" options={{ title: 'Economic calendar' }} />
      <Stack.Screen name="brokers" options={{ title: 'Brokers' }} />
      <Stack.Screen name="resources" options={{ title: 'Resources' }} />
      <Stack.Screen name="reviews" options={{ title: 'Reviews' }} />
      <Stack.Screen name="sales" options={{ title: 'Sales' }} />
      <Stack.Screen name="affiliates" options={{ title: 'Affiliates' }} />
      <Stack.Screen name="withdrawals" options={{ title: 'Withdrawals' }} />
      <Stack.Screen name="payments" options={{ title: 'Payments' }} />
    </Stack>
  )
}
