import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { apiFetch } from '@/api/client'
import { palettes } from '@/theme'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

/**
 * Requests permission, obtains the Expo push token and registers it with
 * the backend (`POST /api/mobile/devices`). Safe to call repeatedly.
 */
export async function registerForPush(): Promise<string | null> {
  if (!Device.isDevice) return null

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Rehan Success alerts',
      importance: Notifications.AndroidImportance.MAX,
      lightColor: palettes.light.primary,
    })
  }

  const { status: existing } = await Notifications.getPermissionsAsync()
  let status = existing
  if (existing !== 'granted') {
    const req = await Notifications.requestPermissionsAsync()
    status = req.status
  }
  if (status !== 'granted') return null

  const projectId = (Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined)?.projectId

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)
    const token = tokenResponse.data
    await apiFetch('/api/mobile/devices', {
      method: 'POST',
      body: { expoPushToken: token, platform: Platform.OS },
    }).catch(() => {})
    return token
  } catch {
    return null
  }
}
