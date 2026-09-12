import { prisma } from '@/lib/prisma'

/**
 * Server-side Expo push helper. Talks to the Expo Push API directly
 * (no extra dependency). All sends are best-effort and never throw into
 * the caller — a failed push must not fail the underlying business action.
 */

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

export type PushPayload = {
  title: string
  body: string
  data?: Record<string, unknown>
}

type ExpoMessage = {
  to: string
  sound: 'default'
  title: string
  body: string
  data?: Record<string, unknown>
  priority: 'high'
}

async function sendToExpo(messages: ExpoMessage[]) {
  if (messages.length === 0) return
  // Expo accepts up to 100 messages per request.
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100)
    try {
      await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      })
    } catch (e) {
      console.error('[push] Expo send failed:', (e as Error).message)
    }
  }
}

function toMessages(tokens: string[], payload: PushPayload): ExpoMessage[] {
  return tokens
    .filter((t) => t && t.startsWith('ExponentPushToken'))
    .map((to) => ({
      to,
      sound: 'default',
      title: payload.title,
      body: payload.body,
      data: payload.data,
      priority: 'high',
    }))
}

/** Push to every device belonging to a single user. */
export async function pushToUser(userId: string, payload: PushPayload) {
  try {
    const devices = await prisma.deviceToken.findMany({
      where: { userId },
      select: { expoPushToken: true },
    })
    await sendToExpo(toMessages(devices.map((d) => d.expoPushToken), payload))
  } catch (e) {
    console.error('[push] pushToUser failed:', (e as Error).message)
  }
}

/** Broadcast to every registered device (e.g. new signal, live session). */
export async function pushToAll(payload: PushPayload) {
  try {
    const devices = await prisma.deviceToken.findMany({
      select: { expoPushToken: true },
    })
    await sendToExpo(toMessages(devices.map((d) => d.expoPushToken), payload))
  } catch (e) {
    console.error('[push] pushToAll failed:', (e as Error).message)
  }
}
