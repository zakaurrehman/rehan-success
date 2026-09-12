import { Redirect } from 'expo-router'
import { useAuth } from '@/auth/AuthContext'

export default function Index() {
  const { user } = useAuth()
  if (!user) return <Redirect href="/(auth)/landing" />
  if (user.role === 'ADMIN') return <Redirect href="/(admin)" />
  return <Redirect href="/(app)/(tabs)/signals" />
}
