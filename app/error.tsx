'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { Icon } from '@/components/brand/icons'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface in the browser console for debugging; no sensitive data is rendered.
    console.error(error)
  }, [error])

  return (
    <main className="min-h-[70dvh] flex flex-col items-center justify-center px-5 text-center">
      <span className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--rs-danger-tint)', color: 'var(--rs-danger-text)' }}>
        <Icon name="alert" size={26} />
      </span>
      <h1 className="text-2xl font-extrabold mt-5">Something went wrong</h1>
      <p className="text-muted mt-2 max-w-sm">An unexpected error occurred while loading this page. Please try again.</p>
      {error.digest ? <p className="text-dim text-xs mt-2 num">Reference: {error.digest}</p> : null}
      <div className="flex gap-2 mt-7">
        <button type="button" onClick={reset} className="btn btn-primary"><Icon name="refresh" size={16} /> Try again</button>
        <Link href="/" className="btn btn-secondary">Home</Link>
      </div>
    </main>
  )
}
