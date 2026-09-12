'use client'
import { useState } from 'react'
import { api, useList, F, toLocalDT } from '@/components/admin/kit'
import { useFeedback, Modal } from '@/components/ui/feedback'
import { PageHeader, EmptyState, ErrorState, SkeletonList } from '@/components/ui/states'
import { Button } from '@/components/ui/Button'
import { formatDateTime } from '@/lib/utils'

type Session = { id: string; title: string; description: string | null; streamUrl: string | null; scheduledAt: string; isLive: boolean }
const EMPTY = { title: '', description: '', streamUrl: '', scheduledAt: '' }

export default function AdminSessionsPage() {
  const { toast, confirm } = useFeedback()
  const { data: sessions, setData: setSessions, loading, error, reload } = useList<Session>('/api/live')
  const [editing, setEditing] = useState<Session | 'new' | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing === 'new') {
        const s = await api<Session>('/api/live', 'POST', form)
        setSessions((prev) => [s, ...prev])
        toast('Session scheduled')
      } else if (editing) {
        const s = await api<Session>('/api/live', 'PATCH', { id: editing.id, ...form })
        setSessions((prev) => prev.map((x) => (x.id === editing.id ? { ...x, ...s } : x)))
        toast('Session updated')
      }
      setEditing(null)
    } catch (err) { toast(err instanceof Error ? err.message : 'Could not save', 'error') } finally { setSaving(false) }
  }

  async function toggleLive(s: Session) {
    const isLive = !s.isLive
    if (isLive && !(await confirm({ title: `Go live with “${s.title}”?`, message: 'Every member with the app gets a “LIVE NOW” push notification.', confirmLabel: 'Go live', tone: 'primary' }))) return
    try {
      await api('/api/live', 'PATCH', { id: s.id, isLive })
      setSessions((prev) => prev.map((x) => (x.id === s.id ? { ...x, isLive } : x)))
      toast(isLive ? 'You are live — members notified' : 'Live session ended')
    } catch { toast('Update failed', 'error') }
  }

  async function remove(s: Session) {
    if (!(await confirm({ title: 'Delete session?', message: `“${s.title}” will be permanently deleted.`, confirmLabel: 'Delete' }))) return
    try {
      await api('/api/live', 'DELETE', { id: s.id })
      setSessions((prev) => prev.filter((x) => x.id !== s.id))
      toast('Session deleted')
    } catch { toast('Could not delete', 'error') }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Live sessions" subtitle={`${sessions.filter((s) => s.isLive).length} live · ${sessions.length} total`} actions={<Button icon="plus" onClick={() => { setForm(EMPTY); setEditing('new') }}>Schedule session</Button>} />

      {loading ? <SkeletonList rows={3} height={84} /> : error ? <ErrorState description={error} action={<Button variant="secondary" onClick={reload}>Retry</Button>} /> : sessions.length === 0 ? (
        <EmptyState icon="radio" title="No sessions yet" action={<Button icon="plus" onClick={() => { setForm(EMPTY); setEditing('new') }}>Schedule a session</Button>} />
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((s) => (
            <article key={s.id} className="card-flat p-4 flex flex-wrap items-center gap-4" style={s.isLive ? { borderColor: 'var(--rs-danger-line)', background: 'var(--rs-danger-tint)' } : { boxShadow: 'var(--rs-shadow-xs)' }}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-ink font-bold">{s.title}</h2>
                  {s.isLive ? <span className="pill pill-solid-danger"><span className="w-1.5 h-1.5 rounded-full bg-white live-dot" /> LIVE</span> : new Date(s.scheduledAt) < new Date() ? <span className="pill pill-neutral">Past</span> : <span className="pill pill-primary">Scheduled</span>}
                </div>
                <div className="text-muted text-sm mt-0.5">{formatDateTime(s.scheduledAt)}{s.streamUrl ? ' · stream link set' : ' · no stream link'}</div>
              </div>
              <div className="flex gap-1.5">
                <Button size="sm" variant={s.isLive ? 'danger' : 'success-soft'} icon={s.isLive ? 'close' : 'radio'} onClick={() => toggleLive(s)}>{s.isLive ? 'End live' : 'Go live'}</Button>
                <Button size="sm" variant="ghost" icon="edit" aria-label="Edit" onClick={() => { setForm({ title: s.title, description: s.description || '', streamUrl: s.streamUrl || '', scheduledAt: toLocalDT(s.scheduledAt) }); setEditing(s) }} />
                <Button size="sm" variant="ghost" icon="trash" aria-label="Delete" onClick={() => remove(s)} />
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Schedule session' : 'Edit session'} width={520}>
        <form onSubmit={save} className="flex flex-col gap-3">
          <F label="Title" htmlFor="l-title"><input id="l-title" className="field" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required /></F>
          <F label="Description" htmlFor="l-desc"><textarea id="l-desc" className="field" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></F>
          <F label="Stream URL (YouTube / Zoom)" htmlFor="l-url"><input id="l-url" className="field" type="url" value={form.streamUrl} onChange={(e) => setForm((f) => ({ ...f, streamUrl: e.target.value }))} placeholder="https://…" /></F>
          <F label="Date & time" htmlFor="l-when"><input id="l-when" className="field" type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))} required /></F>
          <div className="flex justify-end gap-2 mt-2"><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" loading={saving}>{editing === 'new' ? 'Schedule' : 'Save changes'}</Button></div>
        </form>
      </Modal>
    </div>
  )
}
