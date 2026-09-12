import { prisma } from '@/lib/prisma'
import { pushToUser } from '@/lib/push'

/**
 * Single entry point for user notifications: persists the Notification row
 * (same as before) AND fires an Expo push to that user's devices.
 * Drop-in replacement for the old `prisma.notification.create(...)` calls.
 */
export async function createNotification(input: {
  userId: string
  title: string
  message: string
  link?: string | null
}) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      message: input.message,
      link: input.link ?? null,
    },
  })

  // Best-effort push; failures are swallowed inside pushToUser.
  await pushToUser(input.userId, {
    title: input.title,
    body: input.message,
    data: { type: 'notification', link: input.link ?? null, id: notification.id },
  })

  return notification
}
