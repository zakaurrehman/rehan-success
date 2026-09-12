'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { timeAgo } from '@/lib/utils'
import { PageHeader, EmptyState } from '@/components/ui/states'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/brand/icons'
import { useFeedback } from '@/components/ui/feedback'

type Item = { id: string; title: string; message: string; read: boolean; link: string | null; createdAt: string }

function iconFor(n: Item): IconName {
  const t = `${n.title} ${n.link ?? ''}`.toLowerCase()
  if (t.includes('withdraw')) return 'wallet'
  if (t.includes('commission')) return 'dollar'
  if (t.includes('signal')) return 'bolt'
  if (t.includes('live')) return 'radio'
  return 'bell'
}

export default function NotificationList({ items: initial }: { items: Item[] }) {
  const router = useRouter()
  const { toast } = useFeedback()
  const [items, setItems] = useState(initial)
  const [busy, setBusy] = useState(false)
  const unread = items.filter((n) => !n.read).length

  async function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).catch(() => {})
  }

  async function open(n: Item) {
    if (!n.read) await markRead(n.id)
    if (n.link) router.push(n.link)
    else router.refresh()
  }

  async function markAll() {
    setBusy(true)
    const ids = items.filter((n) => !n.read).map((n) => n.id)
    await Promise.all(ids.map((id) => fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).catch(() => {})))
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    setBusy(false)
    toast('All notifications marked as read')
    router.refresh()
  }

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={unread ? `${unread} unread` : 'You’re all caught up'}
        actions={unread ? <Button variant="secondary" size="sm" icon="check" loading={busy} onClick={markAll}>Mark all read</Button> : null}
      />
      {items.length === 0 ? (
        <EmptyState icon="bell" title="No notifications yet" description="Commission updates, withdrawal status and account alerts will show up here." />
      ) : (
        <ul className="card-flat overflow-hidden">
          {items.map((n, i) => (
            <li key={n.id} className={i ? 'border-t hairline' : ''}>
              <button type="button" onClick={() => open(n)} className="w-full text-left flex gap-3.5 px-4 py-4 transition-colors hover:bg-[var(--rs-surface-2)]" style={{ background: n.read ? undefined : 'var(--rs-primary-tint)' }}>
                <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: n.read ? 'var(--rs-surface-2)' : 'var(--rs-surface)', color: n.read ? 'var(--rs-dim)' : 'var(--rs-primary)' }}>
                  <Icon name={iconFor(n)} size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={`text-sm truncate flex-1 ${n.read ? 'text-text font-medium' : 'text-ink font-semibold'}`}>{n.title}</span>
                    <span className="text-dim text-xs shrink-0">{timeAgo(n.createdAt)}</span>
                  </span>
                  <span className="block text-muted text-sm mt-0.5 leading-relaxed">{n.message}</span>
                </span>
                {!n.read ? <span className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: 'var(--rs-primary)' }} aria-label="Unread" /> : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
