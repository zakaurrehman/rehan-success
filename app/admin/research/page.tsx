'use client'
import { useState } from 'react'
import { api, useList, F, Toggle, FilterTabs } from '@/components/admin/kit'
import { useFeedback, Modal } from '@/components/ui/feedback'
import { PageHeader, EmptyState, ErrorState, SkeletonList } from '@/components/ui/states'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

type Post = { id: string; title: string; category: string; content?: string; imageUrl?: string | null; isPremium: boolean; published: boolean; createdAt: string; author: { fullName: string } }
const CATEGORIES = ['Forex', 'Gold', 'Crypto', 'Stocks', 'Indices', 'Crude Oil']
const EMPTY = { title: '', category: 'Forex', content: '', imageUrl: '', isPremium: false }

export default function AdminResearchPage() {
  const { toast, confirm } = useFeedback()
  const { data: posts, setData: setPosts, loading, error, reload } = useList<Post>('/api/research?admin=1')
  const [editing, setEditing] = useState<Post | 'new' | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'PUBLISHED' | 'HIDDEN'>('ALL')

  const shown = posts.filter((p) => filter === 'ALL' || (filter === 'PUBLISHED' ? p.published : !p.published))

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing === 'new') {
        const post = await api<Post>('/api/research', 'POST', form)
        setPosts((prev) => [post, ...prev])
        toast('Post published')
      } else if (editing) {
        const post = await api<Post>('/api/research', 'PATCH', { id: editing.id, ...form })
        setPosts((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...post } : p)))
        toast('Post updated')
      }
      setEditing(null)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function toggle(p: Post, field: 'published' | 'isPremium') {
    const value = !p[field]
    setPosts((prev) => prev.map((x) => (x.id === p.id ? { ...x, [field]: value } : x)))
    try {
      await api('/api/research', 'PATCH', { id: p.id, [field]: value })
    } catch {
      setPosts((prev) => prev.map((x) => (x.id === p.id ? { ...x, [field]: !value } : x)))
      toast('Update failed', 'error')
    }
  }

  async function remove(p: Post) {
    if (!(await confirm({ title: 'Delete post?', message: `“${p.title}” will be permanently deleted.`, confirmLabel: 'Delete' }))) return
    try {
      await api('/api/research', 'DELETE', { id: p.id })
      setPosts((prev) => prev.filter((x) => x.id !== p.id))
      toast('Post deleted')
    } catch { toast('Could not delete', 'error') }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Research posts" subtitle={`${posts.length} posts`} actions={<Button icon="plus" onClick={() => { setForm(EMPTY); setEditing('new') }}>New post</Button>} />
      <div className="mb-4">
        <FilterTabs value={filter} onChange={setFilter} options={[{ key: 'ALL', label: 'All', count: posts.length }, { key: 'PUBLISHED', label: 'Published', count: posts.filter((p) => p.published).length }, { key: 'HIDDEN', label: 'Hidden', count: posts.filter((p) => !p.published).length }]} />
      </div>

      {loading ? <SkeletonList rows={4} height={72} /> : error ? <ErrorState description={error} action={<Button variant="secondary" onClick={reload}>Retry</Button>} /> : shown.length === 0 ? (
        <EmptyState icon="fileText" title="No posts" action={<Button icon="plus" onClick={() => { setForm(EMPTY); setEditing('new') }}>Write a post</Button>} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Title</th><th>Category</th><th>Published</th><th>Premium</th><th>Date</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id}>
                  <td className="text-ink font-semibold max-w-[320px]"><div className="truncate">{p.title}</div></td>
                  <td><span className="pill pill-primary">{p.category}</span></td>
                  <td><SwitchCell on={p.published} onClick={() => toggle(p, 'published')} label="Published" /></td>
                  <td><SwitchCell on={p.isPremium} onClick={() => toggle(p, 'isPremium')} label="Premium" gold /></td>
                  <td className="text-dim whitespace-nowrap">{formatDate(p.createdAt)}</td>
                  <td className="text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" icon="edit" onClick={() => { setForm({ title: p.title, category: p.category, content: p.content || '', imageUrl: p.imageUrl || '', isPremium: p.isPremium }); setEditing(p) }}>Edit</Button>
                    <Button size="sm" variant="ghost" icon="trash" onClick={() => remove(p)} aria-label="Delete" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'New research post' : 'Edit research post'} width={640}>
        <form onSubmit={save} className="flex flex-col gap-3">
          <F label="Title" htmlFor="r-title"><input id="r-title" className="field" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required /></F>
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="Category" htmlFor="r-cat"><select id="r-cat" className="field" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></F>
            <F label="Image URL (optional)" htmlFor="r-img"><input id="r-img" className="field" type="url" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" /></F>
          </div>
          <F label="Content / analysis" htmlFor="r-content"><textarea id="r-content" className="field" rows={9} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} required /></F>
          <Toggle checked={form.isPremium} onChange={(v) => setForm((f) => ({ ...f, isPremium: v }))} label="Premium only" description="Only Premium plan members can read the full analysis." />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing === 'new' ? 'Publish post' : 'Save changes'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function SwitchCell({ on, onClick, label, gold }: { on: boolean; onClick: () => void; label: string; gold?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onClick} className="relative w-10 h-[22px] rounded-full transition-colors" style={{ background: on ? (gold ? 'var(--rs-gold)' : 'var(--rs-primary)') : 'var(--rs-line-strong)' }}>
      <span className="absolute top-[3px] w-4 h-4 rounded-full bg-white transition-all" style={{ left: on ? 21 : 3 }} />
    </button>
  )
}
