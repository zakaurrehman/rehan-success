'use client'
import { useState } from 'react'
import { api, useList, F, toLocalDT } from '@/components/admin/kit'
import { useFeedback, Modal } from '@/components/ui/feedback'
import { PageHeader, EmptyState, ErrorState, SkeletonList } from '@/components/ui/states'
import { Button } from '@/components/ui/Button'
import { formatDateTime } from '@/lib/utils'

type Event = { id: string; name: string; currency: string; impact: string; eventTime: string; actual: string | null; forecast: string | null; previous: string | null }
const EMPTY = { name: '', currency: 'USD', impact: 'HIGH', eventTime: '', forecast: '', previous: '' }
const IMPACT_CLS: Record<string, string> = { HIGH: 'pill-danger', MEDIUM: 'pill-warning', LOW: 'pill-success' }

export default function AdminCalendarPage() {
  const { toast, confirm, prompt } = useFeedback()
  const { data: events, setData: setEvents, loading, error, reload } = useList<Event>('/api/calendar')
  const [editing, setEditing] = useState<Event | 'new' | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing === 'new') {
        const ev = await api<Event>('/api/calendar', 'POST', form)
        setEvents((prev) => [ev, ...prev])
        toast('Event added')
      } else if (editing) {
        const ev = await api<Event>('/api/calendar', 'PATCH', { id: editing.id, ...form })
        setEvents((prev) => prev.map((x) => (x.id === editing.id ? { ...x, ...ev } : x)))
        toast('Event updated')
      }
      setEditing(null)
    } catch (err) { toast(err instanceof Error ? err.message : 'Could not save', 'error') } finally { setSaving(false) }
  }

  async function setActual(ev: Event) {
    const actual = await prompt({ title: `Actual result — ${ev.name}`, label: 'Actual', placeholder: 'e.g. 210K', defaultValue: ev.actual || '', required: true, confirmLabel: 'Save actual' })
    if (!actual) return
    try {
      await api('/api/calendar', 'PATCH', { id: ev.id, actual })
      setEvents((prev) => prev.map((x) => (x.id === ev.id ? { ...x, actual } : x)))
      toast('Actual saved')
    } catch { toast('Update failed', 'error') }
  }

  async function remove(ev: Event) {
    if (!(await confirm({ title: 'Delete event?', message: `“${ev.name}” will be permanently deleted.`, confirmLabel: 'Delete' }))) return
    try {
      await api('/api/calendar', 'DELETE', { id: ev.id })
      setEvents((prev) => prev.filter((x) => x.id !== ev.id))
      toast('Event deleted')
    } catch { toast('Could not delete', 'error') }
  }

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fade-in">
      <PageHeader title="Economic calendar" subtitle={`${events.length} events`} actions={<Button icon="plus" onClick={() => { setForm(EMPTY); setEditing('new') }}>Add event</Button>} />

      {loading ? <SkeletonList rows={5} height={56} /> : error ? <ErrorState description={error} action={<Button variant="secondary" onClick={reload}>Retry</Button>} /> : events.length === 0 ? (
        <EmptyState icon="calendar" title="No events yet" action={<Button icon="plus" onClick={() => { setForm(EMPTY); setEditing('new') }}>Add an event</Button>} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>When</th><th>Event</th><th>Impact</th><th>Forecast</th><th>Previous</th><th>Actual</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td className="text-muted whitespace-nowrap">{formatDateTime(ev.eventTime)}</td>
                  <td><span className="num text-ink font-semibold mr-2">{ev.currency}</span><span className="text-ink">{ev.name}</span></td>
                  <td><span className={`pill ${IMPACT_CLS[ev.impact] || 'pill-neutral'}`}>{ev.impact}</span></td>
                  <td className="num">{ev.forecast || '—'}</td>
                  <td className="num text-muted">{ev.previous || '—'}</td>
                  <td>{ev.actual ? <button type="button" className="num font-semibold" style={{ color: 'var(--rs-success-text)' }} onClick={() => setActual(ev)}>{ev.actual}</button> : <Button size="xs" variant="outline" icon="plus" onClick={() => setActual(ev)}>Actual</Button>}</td>
                  <td className="text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" icon="edit" aria-label="Edit" onClick={() => { setForm({ name: ev.name, currency: ev.currency, impact: ev.impact, eventTime: toLocalDT(ev.eventTime), forecast: ev.forecast || '', previous: ev.previous || '' }); setEditing(ev) }} />
                    <Button size="sm" variant="ghost" icon="trash" aria-label="Delete" onClick={() => remove(ev)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add event' : 'Edit event'} width={520}>
        <form onSubmit={save} className="grid grid-cols-2 gap-3">
          <F label="Event name" htmlFor="e-name" className="col-span-2"><input id="e-name" className="field" value={form.name} onChange={set('name')} placeholder="Non-Farm Payrolls" required /></F>
          <F label="Currency" htmlFor="e-cur"><select id="e-cur" className="field" value={form.currency} onChange={set('currency')}>{['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD'].map((c) => <option key={c}>{c}</option>)}</select></F>
          <F label="Impact" htmlFor="e-imp"><select id="e-imp" className="field" value={form.impact} onChange={set('impact')}><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></F>
          <F label="Date & time" htmlFor="e-when" className="col-span-2"><input id="e-when" className="field" type="datetime-local" value={form.eventTime} onChange={set('eventTime')} required /></F>
          <F label="Forecast" htmlFor="e-fc"><input id="e-fc" className="field num" value={form.forecast} onChange={set('forecast')} placeholder="200K" /></F>
          <F label="Previous" htmlFor="e-prev"><input id="e-prev" className="field num" value={form.previous} onChange={set('previous')} placeholder="175K" /></F>
          <div className="col-span-2 flex justify-end gap-2 mt-2"><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" loading={saving}>{editing === 'new' ? 'Add event' : 'Save changes'}</Button></div>
        </form>
      </Modal>
    </div>
  )
}
