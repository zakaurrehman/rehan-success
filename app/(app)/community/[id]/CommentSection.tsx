'use client'
import { useState } from 'react'
import { timeAgo } from '@/lib/utils'
import { Avatar } from '@/components/ui/states'
import { Button } from '@/components/ui/Button'
import { useFeedback } from '@/components/ui/feedback'

type Comment = { id: string; content: string; authorName: string; studentId: string; createdAt: string }

export default function CommentSection({ postId, comments: initial }: { postId: string; comments: Comment[] }) {
  const { toast } = useFeedback()
  const [comments, setComments] = useState(initial)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/community/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId, content }) })
      const data = await res.json()
      if (!res.ok || !data.comment) throw new Error()
      setComments((prev) => [...prev, data.comment])
      setContent('')
    } catch {
      toast('Could not post your comment', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mt-6" aria-labelledby="comments-title">
      <h2 id="comments-title" className="section-title mb-3">{comments.length} comment{comments.length === 1 ? '' : 's'}</h2>

      <form onSubmit={submit} className="card-flat p-3 flex flex-col sm:flex-row gap-2 mb-4">
        <label htmlFor="comment" className="sr-only">Add a comment</label>
        <textarea id="comment" className="field flex-1 !min-h-[44px]" rows={1} placeholder="Add to the discussion…" value={content} onChange={(e) => setContent(e.target.value)} required />
        <Button type="submit" loading={loading} icon="send" className="sm:self-start">Comment</Button>
      </form>

      {comments.length === 0 ? (
        <p className="text-dim text-sm text-center py-6">No comments yet — be the first to reply.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <Avatar name={c.authorName} size={32} />
              <div className="flex-1 min-w-0 card-flat px-4 py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-ink text-sm font-semibold">{c.authorName}</span>
                  <span className="text-faint text-xs">{c.studentId}</span>
                  <span className="text-dim text-xs ml-auto">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="text-text text-sm leading-relaxed mt-1 whitespace-pre-wrap">{c.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
