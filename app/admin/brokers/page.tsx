'use client'
import { useState } from 'react'
import { api, useList, F, Toggle } from '@/components/admin/kit'
import { useFeedback, Modal } from '@/components/ui/feedback'
import { PageHeader, EmptyState, ErrorState, SkeletonList } from '@/components/ui/states'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/brand/icons'

type Broker = { id: string; name: string; description: string; rating: number; link: string; isRecommended: boolean; isActive: boolean; minDeposit: string | null; regulation: string | null }
const EMPTY = { name: '', description: '', rating: '4.5', link: '', minDeposit: '', regulation: '', isRecommended: false }

export default function AdminBrokersPage() {
  const { toast, confirm } = useFeedback()
  const { data: brokers, setData: setBrokers, loading, error, reload } = useList<Broker>('/api/brokers?all=1')
  const [editing, setEditing] = useState<Broker | 'new' | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing === 'new') {
        const b = await api<Broker>('/api/brokers', 'POST', { ...form, rating: +form.rating })
        setBrokers((prev) => [b, ...prev])
        toast('Broker added')
      } else if (editing) {
        const b = await api<Broker>('/api/brokers', 'PATCH', { id: editing.id, ...form, rating: +form.rating })
        setBrokers((prev) => prev.map((x) => (x.id === editing.id ? { ...x, ...b } : x)))
        toast('Broker updated')
      }
      setEditing(null)
    } catch (err) { toast(err instanceof Error ? err.message : 'Could not save', 'error') } finally { setSaving(false) }
  }

  async function toggle(b: Broker, field: 'isActive' | 'isRecommended') {
    const value = !b[field]
    setBrokers((prev) => prev.map((x) => (x.id === b.id ? { ...x, [field]: value } : x)))
    try { await api('/api/brokers', 'PATCH', { id: b.id, [field]: value }) } catch {
      setBrokers((prev) => prev.map((x) => (x.id === b.id ? { ...x, [field]: !value } : x)))
      toast('Update failed', 'error')
    }
  }

  async function remove(b: Broker) {
    if (!(await confirm({ title: 'Delete broker?', message: `“${b.name}” will be permanently deleted.`, confirmLabel: 'Delete' }))) return
    try {
      await api('/api/brokers', 'DELETE', { id: b.id })
      setBrokers((prev) => prev.filter((x) => x.id !== b.id))
      toast('Broker deleted')
    } catch { toast('Could not delete', 'error') }
  }

  const set = (k: 'name' | 'description' | 'rating' | 'link' | 'minDeposit' | 'regulation') => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fade-in">
      <PageHeader title="Brokers" subtitle={`${brokers.filter((b) => b.isActive).length} visible · ${brokers.length} total`} actions={<Button icon="plus" onClick={() => { setForm(EMPTY); setEditing('new') }}>Add broker</Button>} />

      {loading ? <SkeletonList rows={3} height={110} /> : error ? <ErrorState description={error} action={<Button variant="secondary" onClick={reload}>Retry</Button>} /> : brokers.length === 0 ? (
        <EmptyState icon="building" title="No brokers yet" action={<Button icon="plus" onClick={() => { setForm(EMPTY); setEditing('new') }}>Add a broker</Button>} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {brokers.map((b) => (
            <article key={b.id} className="card-flat p-4 flex flex-col" style={{ opacity: b.isActive ? 1 : 0.65, boxShadow: 'var(--rs-shadow-xs)' }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap"><h2 className="text-ink font-bold">{b.name}</h2>{b.isRecommended ? <span className="pill pill-gold">Our pick</span> : null}{!b.isActive ? <span className="pill pill-neutral">Hidden</span> : null}</div>
                  <div className="text-dim text-xs mt-0.5 flex gap-3 flex-wrap"><span className="inline-flex items-center gap-1"><Icon name="star" size={11} /> {b.rating}</span>{b.minDeposit ? <span>Min {b.minDeposit}</span> : null}{b.regulation ? <span>{b.regulation}</span> : null}</div>
                </div>
                <div className="flex">
                  <Button size="sm" variant="ghost" icon="edit" aria-label="Edit" onClick={() => { setForm({ name: b.name, description: b.description, rating: String(b.rating), link: b.link, minDeposit: b.minDeposit || '', regulation: b.regulation || '', isRecommended: b.isRecommended }); setEditing(b) }} />
                  <Button size="sm" variant="ghost" icon="trash" aria-label="Delete" onClick={() => remove(b)} />
                </div>
              </div>
              <p className="text-muted text-sm mt-2 line-clamp-2 flex-1">{b.description}</p>
              <div className="flex gap-2 mt-3 pt-3 border-t hairline">
                <Button size="sm" variant={b.isRecommended ? 'gold' : 'secondary'} icon="award" onClick={() => toggle(b, 'isRecommended')}>{b.isRecommended ? 'Featured' : 'Feature'}</Button>
                <Button size="sm" variant="secondary" icon={b.isActive ? 'eyeOff' : 'eye'} onClick={() => toggle(b, 'isActive')}>{b.isActive ? 'Hide' : 'Show'}</Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add broker' : 'Edit broker'} width={560}>
        <form onSubmit={save} className="grid sm:grid-cols-2 gap-3">
          <F label="Name" htmlFor="b-name"><input id="b-name" className="field" value={form.name} onChange={set('name')} placeholder="Broker name" required /></F>
          <F label="Rating (1–5)" htmlFor="b-rating"><input id="b-rating" className="field num" type="number" step="0.1" min="1" max="5" value={form.rating} onChange={set('rating')} required /></F>
          <F label="Affiliate link" htmlFor="b-link" className="sm:col-span-2"><input id="b-link" className="field" type="url" value={form.link} onChange={set('link')} placeholder="https://…" required /></F>
          <F label="Min deposit" htmlFor="b-min"><input id="b-min" className="field" value={form.minDeposit} onChange={set('minDeposit')} placeholder="$10" /></F>
          <F label="Regulation" htmlFor="b-reg"><input id="b-reg" className="field" value={form.regulation} onChange={set('regulation')} placeholder="FCA, CySEC" /></F>
          <F label="Description" htmlFor="b-desc" className="sm:col-span-2"><textarea id="b-desc" className="field" rows={3} value={form.description} onChange={set('description')} required /></F>
          <div className="sm:col-span-2"><Toggle checked={form.isRecommended} onChange={(v) => setForm((f) => ({ ...f, isRecommended: v }))} label="Our pick" description="Highlight this broker at the top of the list." /></div>
          <div className="sm:col-span-2 flex justify-end gap-2 mt-2"><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" loading={saving}>{editing === 'new' ? 'Add broker' : 'Save changes'}</Button></div>
        </form>
      </Modal>
    </div>
  )
}
