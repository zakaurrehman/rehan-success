import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'rs_ref_code'

/** Extract a referral code from a deep link like rehansuccess://ref/CODE
 *  or https://host/ref/CODE (also accepts ?ref=CODE). */
export function parseRefCode(url: string): string | null {
  try {
    const refMatch = url.match(/\/ref\/([A-Za-z0-9_-]+)/)
    if (refMatch) return refMatch[1]
    const qMatch = url.match(/[?&]ref=([A-Za-z0-9_-]+)/)
    if (qMatch) return qMatch[1]
  } catch {
    /* noop */
  }
  return null
}

export async function saveRefCode(code: string): Promise<void> {
  await AsyncStorage.setItem(KEY, code).catch(() => {})
}

export async function getRefCode(): Promise<string | null> {
  return AsyncStorage.getItem(KEY).catch(() => null)
}

export async function clearRefCode(): Promise<void> {
  await AsyncStorage.removeItem(KEY).catch(() => {})
}
