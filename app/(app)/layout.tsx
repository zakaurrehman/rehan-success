import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SideNav from '@/components/app/SideNav'
import TopBar from '@/components/app/TopBar'
import BottomNav from '@/components/app/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.role === 'ADMIN') redirect('/admin')

  const unread = await prisma.notification.count({ where: { userId: session.user.id, read: false } })
  const name = session.user.name || 'Trader'
  const plan = session.user.plan || 'FREE'

  return (
    <div className="app-shell">
      <SideNav name={name} plan={plan} />
      <div className="min-w-0">
        <TopBar name={name} plan={plan} unread={unread} />
        <main className="app-main mx-auto" id="main">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
