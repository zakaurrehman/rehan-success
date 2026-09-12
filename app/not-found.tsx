import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { Icon } from '@/components/brand/icons'

export default function NotFound() {
  return (
    <main className="min-h-dvh bg-canvas flex flex-col items-center justify-center px-5 text-center">
      <Logo size={36} />
      <p className="num text-7xl font-semibold mt-10 text-gradient">404</p>
      <h1 className="text-2xl font-extrabold mt-3">This page doesn’t exist</h1>
      <p className="text-muted mt-2 max-w-sm">The link may be broken or the page may have moved.</p>
      <div className="flex gap-2 mt-7">
        <Link href="/" className="btn btn-secondary"><Icon name="home" size={16} /> Home</Link>
        <Link href="/dashboard" className="btn btn-primary">Go to dashboard</Link>
      </div>
    </main>
  )
}
