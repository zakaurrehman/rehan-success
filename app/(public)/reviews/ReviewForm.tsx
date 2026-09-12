'use client'
import { useState } from 'react'
import { StarPicker } from '@/components/StarRating'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/brand/icons'

export default function ReviewForm() {
  const [form, setForm] = useState({ clientName: '', email: '', rating: 5, content: '' })
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error()
      setSuccess(true)
    } catch {
      setError('Your review couldn’t be submitted. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="card p-8 text-center max-w-[560px] mx-auto">
        <span className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--rs-success-tint)', color: 'var(--rs-success-text)' }}>
          <Icon name="checkCircle" size={28} />
        </span>
        <p className="text-ink font-semibold mt-4">Thank you — review submitted</p>
        <p className="text-muted text-sm mt-1">It will appear here once our team approves it.</p>
      </div>
    )
  }

  return (
    <div className="card p-6 sm:p-8 max-w-[600px] mx-auto">
      <h2 className="text-xl font-bold">Leave a review</h2>
      <p className="text-muted text-sm mt-1">Reviews are moderated before they’re published.</p>
      <form onSubmit={submit} className="flex flex-col gap-4 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="r-name">Your name</label>
            <input id="r-name" className="field" value={form.clientName} onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))} required placeholder="Jane D." autoComplete="name" />
          </div>
          <div>
            <label className="field-label" htmlFor="r-email">Email <span className="text-dim font-normal">(optional)</span></label>
            <input id="r-email" className="field" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@example.com" autoComplete="email" />
          </div>
        </div>
        <div>
          <span className="field-label">Rating</span>
          <StarPicker value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
        </div>
        <div>
          <label className="field-label" htmlFor="r-content">Your review</label>
          <textarea id="r-content" className="field" rows={4} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} required placeholder="What has your experience been like?" />
        </div>
        {error ? <div className="alert alert-danger" role="alert"><Icon name="alert" size={16} /><span>{error}</span></div> : null}
        <Button type="submit" loading={loading} className="self-start" icon="send">{loading ? 'Submitting…' : 'Submit review'}</Button>
      </form>
    </div>
  )
}
