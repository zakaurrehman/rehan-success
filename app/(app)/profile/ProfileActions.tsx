'use client'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { useFeedback } from '@/components/ui/feedback'
import { useTheme } from '@/components/ui/ThemeToggle'
import { Icon } from '@/components/brand/icons'

export default function ProfileActions() {
  const { confirm, toast } = useFeedback()
  const [mode, setMode] = useTheme()
  const [deleting, setDeleting] = useState(false)

  async function deleteAccount() {
    const ok = await confirm({
      title: 'Delete your account?',
      message: 'This permanently deletes your profile, course progress, certificates, posts, comments and affiliate records. This cannot be undone.',
      confirmLabel: 'Delete permanently',
    })
    if (!ok) return
    setDeleting(true)
    try {
      const res = await fetch('/api/mobile/auth/delete-account', { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not delete account')
      toast('Your account has been deleted')
      await signOut({ callbackUrl: '/' })
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not delete account', 'error')
      setDeleting(false)
    }
  }

  return (
    <>
      <section className="card">
        <h2 className="text-base font-bold mb-3">Appearance</h2>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Theme">
          {(['light', 'dark'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => setMode(m)}
              className="card-sub flex items-center gap-2.5 text-sm font-semibold transition-colors"
              style={mode === m ? { borderColor: 'var(--rs-primary)', color: 'var(--rs-primary)', background: 'var(--rs-primary-tint)' } : { color: 'var(--rs-text)' }}
            >
              <Icon name={m === 'light' ? 'sun' : 'moon'} size={17} /> {m === 'light' ? 'Light' : 'Dark'}
            </button>
          ))}
        </div>
      </section>

      <Button variant="secondary" icon="logout" block onClick={() => signOut({ callbackUrl: '/login' })}>Sign out</Button>

      <section className="rounded-2xl border p-5" style={{ borderColor: 'var(--rs-danger-line)', background: 'var(--rs-danger-tint)' }}>
        <h2 className="text-base font-bold" style={{ color: 'var(--rs-danger-text)' }}>Danger zone</h2>
        <p className="text-muted text-sm mt-1 leading-relaxed">Permanently delete your account and all associated data.</p>
        <div className="mt-4"><Button variant="danger" size="sm" icon="trash" loading={deleting} onClick={deleteAccount}>Delete my account</Button></div>
      </section>
    </>
  )
}
