'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/states'
import { useFeedback } from '@/components/ui/feedback'

export default function CommunityPostForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useFeedback()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/community', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error()
      setForm({ title: '', content: '' })
      setOpen(false)
      toast('Post published')
      router.refresh()
    } catch {
      toast('Could not publish your post. Try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="card-flat w-full flex items-center gap-3 p-3.5 mb-5 text-left transition-colors hover:border-[var(--rs-primary-line)]"
      >
        <Avatar name={session?.user?.name || 'You'} size={36} />
        <span className="flex-1 text-dim text-sm">Share an analysis or ask a question…</span>
        <span className="btn btn-primary btn-sm">Post</span>
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="card mb-5 flex flex-col gap-3">
      <label className="sr-only" htmlFor="post-title">Title</label>
      <input id="post-title" className="field font-semibold" placeholder="Title or pair (e.g. EUR/USD H4 outlook)" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required autoFocus maxLength={140} />
      <label className="sr-only" htmlFor="post-content">Post</label>
      <textarea id="post-content" className="field" placeholder="What are you seeing in the market?" rows={5} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} required />
      <div className="flex items-center justify-between gap-2">
        <span className="text-dim text-xs">Be respectful. No financial promotions.</span>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" loading={loading} icon="send">{loading ? 'Posting…' : 'Publish'}</Button>
        </div>
      </div>
    </form>
  )
}
