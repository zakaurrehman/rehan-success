'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@/components/brand/icons'
import { useFeedback } from '@/components/ui/feedback'

type Reaction = 'LIKE' | 'DISLIKE' | null

/**
 * Like / dislike toggle. Mirrors the API semantics: tapping the same reaction
 * removes it, tapping the other one switches. Optimistic, rolled back on error.
 */
export default function ReactionButtons({ postId, likes, dislikes, userReaction }: { postId: string; likes: number; dislikes: number; userReaction: Reaction }) {
  const router = useRouter()
  const { toast } = useFeedback()
  const [state, setState] = useState({ likes, dislikes, mine: userReaction })
  const [busy, setBusy] = useState(false)

  async function react(type: 'LIKE' | 'DISLIKE') {
    if (busy) return
    const prev = state
    const next = { ...state }
    if (state.mine === type) {
      next.mine = null
      if (type === 'LIKE') next.likes-- ; else next.dislikes--
    } else {
      if (state.mine === 'LIKE') next.likes--
      if (state.mine === 'DISLIKE') next.dislikes--
      next.mine = type
      if (type === 'LIKE') next.likes++ ; else next.dislikes++
    }
    setState(next)
    setBusy(true)
    try {
      const res = await fetch('/api/community', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId, type }) })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setState(prev)
      toast('Could not save your reaction', 'error')
    } finally {
      setBusy(false)
    }
  }

  const base = 'btn btn-sm'
  return (
    <div className="flex gap-2">
      <button type="button" onClick={() => react('LIKE')} className={`${base} ${state.mine === 'LIKE' ? 'btn-success-soft' : 'btn-secondary'}`} aria-pressed={state.mine === 'LIKE'}>
        <Icon name="thumbsUp" size={15} /> <span className="num">{state.likes}</span>
      </button>
      <button type="button" onClick={() => react('DISLIKE')} className={`${base} ${state.mine === 'DISLIKE' ? 'btn-danger-soft' : 'btn-secondary'}`} aria-pressed={state.mine === 'DISLIKE'}>
        <Icon name="thumbsDown" size={15} /> <span className="num">{state.dislikes}</span>
      </button>
    </div>
  )
}
