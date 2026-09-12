import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import LandingPage from './(public)/landing/page'

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (session) {
    if (session.user.role === 'ADMIN') redirect('/admin')
    redirect('/dashboard')
  }
  return <LandingPage />
}
