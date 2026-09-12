import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import NotificationList from './NotificationList'

export const metadata: Metadata = { title: 'Notifications' }

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)
  const notifications = await prisma.notification.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div className="fade-in max-w-3xl">
      <NotificationList items={notifications.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))} />
    </div>
  )
}
