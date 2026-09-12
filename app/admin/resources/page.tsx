'use client'
import { useState } from 'react'
import { api, useList, F } from '@/components/admin/kit'
import { useFeedback, Modal } from '@/components/ui/feedback'
import { PageHeader, EmptyState, ErrorState, SkeletonList } from '@/components/ui/states'
import { Button } from '@/components/ui/Button'

type Resource = { id: string; title: string; description: string; fileUrl: string; category: string; tier: string; downloads: number }
const CATEGORIES = ['Forex Basics', 'ICT Concepts', 'Risk Management', 'COT Research', 'Chart Patterns', 'Psychology']
const EMPTY = { title: '', description: '', fileUrl: '', category: 'Forex Basics', tier: 'FREE' }
const TIER_CLS: Record<string, string> = { FREE: 'pill-success', BASIC: 'pill-primary', PREMIUM: 'pill-gold' }

export default function AdminResourcesPage() {
  const { toast, confirm } = useFeedback()
  const { data: resources, setData: setResources, loading, error, reload } = useList<Resource>('/api/resources')
  const [editing, setEditing] = useState<Resource | 'new' | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing === 'new') {
        const r = await api<Resource>('/api/resources', 'POST', form)
        setResources((prev) => [r, ...prev])
        toast('Resource added')
      } else if (editing) {
        const r = await api<Resource>('/api/resources', 'PATCH', { id: editing.id, ...form })
        setResources((prev) => prev.map((x) => (x.id === editing.id ? { ...x, ...r } : x)))
        toast('Resource updated')
      }
      setEditing(null)
    } catch (err) { toast(err instanceof Error ? err.message : 'Could not save', 'error') } finally { setSaving(false) }
  }

  async function remove(r: Resource) {
    if (!(await confirm({ title: 'Delete resource?', message: `“${r.title}” will be permanently deleted.`, confirmLabel: 'Delete' }))) return
    try {
      await api('/api/resources', 'DELETE', { id: r.id })
      setResources((prev) => prev.filter((x) => x.id !== r.id))
      toast('Resource deleted')
    } catch { toast('Could not delete', 'error') }
  }

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fade-in">
      <PageHeader title="Resource library" subtitle={`${resources.length} resources`} actions={<Button icon="plus" onClick={() => { setForm(EMPTY); setEditing('new') }}>Add resource</Button>} />

      {loading ? <SkeletonList rows={4} height={60} /> : error ? <ErrorState description={error} action={<Button variant="secondary" onClick={reload}>Retry</Button>} /> : resources.length === 0 ? (
        <EmptyState icon="layers" title="No resources yet" action={<Button icon="plus" onClick={() => { setForm(EMPTY); setEditing('new') }}>Add a resource</Button>} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Title</th><th>Category</th><th>Tier</th><th className="text-right">Downloads</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.id}>
                  <td className="max-w-[340px]"><div className="text-ink font-semibold truncate">{r.title}</div><div className="text-dim text-xs truncate">{r.description}</div></td>
                  <td className="text-muted whitespace-nowrap">{r.category}</td>
                  <td><span className={`pill ${TIER_CLS[r.tier] || 'pill-neutral'}`}>{r.tier}</span></td>
                  <td className="num text-right">{r.downloads}</td>
                  <td className="text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" icon="external" aria-label="Open file" href={r.fileUrl} external />
                    <Button size="sm" variant="ghost" icon="edit" aria-label="Edit" onClick={() => { setForm({ title: r.title, description: r.description, fileUrl: r.fileUrl, category: r.category, tier: r.tier }); setEditing(r) }} />
                    <Button size="sm" variant="ghost" icon="trash" aria-label="Delete" onClick={() => remove(r)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add resource' : 'Edit resource'} width={540}>
        <form onSubmit={save} className="grid sm:grid-cols-2 gap-3">
          <F label="Title" htmlFor="res-title" className="sm:col-span-2"><input id="res-title" className="field" value={form.title} onChange={set('title')} required /></F>
          <F label="Description" htmlFor="res-desc" className="sm:col-span-2"><textarea id="res-desc" className="field" rows={2} value={form.description} onChange={set('description')} required /></F>
          <F label="File URL (Google Drive / Dropbox)" htmlFor="res-url" className="sm:col-span-2"><input id="res-url" className="field" type="url" value={form.fileUrl} onChange={set('fileUrl')} required placeholder="https://…" /></F>
          <F label="Category" htmlFor="res-cat"><select id="res-cat" className="field" value={form.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}{!CATEGORIES.includes(form.category) ? <option>{form.category}</option> : null}</select></F>
          <F label="Tier" htmlFor="res-tier" hint="Basic: any paid plan · Premium: Advanced and above"><select id="res-tier" className="field" value={form.tier} onChange={set('tier')}><option>FREE</option><option>BASIC</option><option>PREMIUM</option></select></F>
          <div className="sm:col-span-2 flex justify-end gap-2 mt-2"><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" loading={saving}>{editing === 'new' ? 'Add resource' : 'Save changes'}</Button></div>
        </form>
      </Modal>
    </div>
  )
}
