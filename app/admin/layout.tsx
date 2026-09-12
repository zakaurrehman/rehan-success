import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata: Metadata = { title: { default: 'Admin', template: '%s · Admin · Rehan Success' }, robots: { index: false, follow: false } }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const [payments, withdrawals, reviews, affiliates] = await Promise.all([
    prisma.paymentRequest.count({ where: { status: 'PENDING' } }),
    prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
    prisma.review.count({ where: { status: 'PENDING' } }),
    prisma.user.count({ where: { role: 'AFFILIATE', status: 'PENDING' } }),
  ])

  return (
    <div className="admin-shell">
      <AdminSidebar counts={{ payments, withdrawals, reviews, affiliates }} />
      <main className="admin-main w-full max-w-[1200px]">{children}</main>
    </div>
  )
}
