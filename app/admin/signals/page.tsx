'use client'
import { useMemo, useState } from 'react'
import { api, useList, F, FilterTabs } from '@/components/admin/kit'
import { useFeedback, Modal } from '@/components/ui/feedback'
import { PageHeader, EmptyState, ErrorState, SkeletonList, StatusPill } from '@/components/ui/states'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/brand/icons'
import { formatDateTime, formatPrice } from '@/lib/utils'

type Signal = { id: string; pair: string; direction: string; entry: number; tp1: number; tp2: number | null; tp3: number | null; sl: number; status: string; pips: number | null; notes: string | null; createdAt: string }

const PAIRS = ['EUR/USD', 'GBP/USD', 'XAU/USD', 'USD/JPY', 'GBP/JPY', 'USD/CHF', 'USD/CAD', 'AUD/USD', 'NZD/USD', 'EUR/JPY', 'USOIL', 'US30', 'NAS100']
const EMPTY = { pair: 'EUR/USD', direction: 'BUY', entry: '', tp1: '', tp2: '', tp3: '', sl: '', notes: '' }

export default function AdminSignalsPage() {
  const { toast, confirm, prompt } = useFeedback()
  const { data: signals, setData: setSignals, loading, error, reload } = useList<Signal>('/api/signals?all=1')
  const [filter, setFilter] = useState<'ACTIVE' | 'CLOSED' | 'ALL'>('ACTIVE')
  const [editing, setEditing] = useState<Signal | 'new' | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const counts = useMemo(() => ({ ACTIVE: signals.filter((s) => s.status === 'ACTIVE').length, ALL: signals.length }), [signals])
  const shown = signals.filter((s) => filter === 'ALL' || (filter === 'ACTIVE' ? s.status === 'ACTIVE' : s.status !== 'ACTIVE'))

  function openNew() { setForm(EMPTY); setEditing('new') }
  function openEdit(s: Signal) {
    setForm({ pair: s.pair, direction: s.direction, entry: String(s.entry), tp1: String(s.tp1), tp2: s.tp2 != null ? String(s.tp2) : '', tp3: s.tp3 != null ? String(s.tp3) : '', sl: String(s.sl), notes: s.notes || '' })
    setEditing(s)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = { pair: form.pair, direction: form.direction, entry: +form.entry, tp1: +form.tp1, tp2: form.tp2 ? +form.tp2 : null, tp3: form.tp3 ? +form.tp3 : null, sl: +form.sl, notes: form.notes }
    try {
      if (editing === 'new') {
        const created = await api<Signal>('/api/signals', 'POST', payload)
        setSignals((prev) => [created, ...prev])
        toast('Signal published — members have been notified')
      } else if (editing) {
        const updated = await api<Signal>('/api/signals', 'PATCH', { id: editing.id, ...payload })
        setSignals((prev) => prev.map((x) => (x.id === editing.id ? { ...x, ...updated } : x)))
        toast('Signal updated')
      }
      setEditing(null)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save signal', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function updateStatus(s: Signal, status: string) {
    let pips: number | undefined
    if (status === 'HIT_TP' || status === 'HIT_SL') {
      const v = await prompt({
        title: status === 'HIT_TP' ? `Close ${s.pair} at take profit` : `Close ${s.pair} at stop loss`,
        message: 'Members receive a push notification with the result.',
        label: status === 'HIT_TP' ? 'Pips gained (optional)' : 'Pips lost (optional)',
        inputType: 'number',
        placeholder: status === 'HIT_TP' ? 'e.g. 125' : 'e.g. -80',
        confirmLabel: status === 'HIT_TP' ? 'Mark TP hit' : 'Mark SL hit',
      })
      if (v === null) return
      pips = v ? +v : undefined
    } else if (status === 'CLOSED') {
      const ok = await confirm({ title: `Close ${s.pair} signal?`, message: 'Members will be notified the signal is closed.', confirmLabel: 'Close signal', tone: 'primary' })
      if (!ok) return
    }
    try {
      await api('/api/signals', 'PATCH', { id: s.id, status, pips })
      setSignals((prev) => prev.map((x) => (x.id === s.id ? { ...x, status, pips: pips ?? x.pips } : x)))
      toast(status === 'ACTIVE' ? 'Signal reopened' : 'Signal updated')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed', 'error')
    }
  }

  async function remove(s: Signal) {
    const ok = await confirm({
      title: `Delete ${s.pair} ${s.direction} signal?`,
      message: 'It will be removed from signal history and no longer count toward stats. This cannot be undone.',
      confirmLabel: 'Delete signal',
    })
    if (!ok) return
    try {
      await api('/api/signals', 'DELETE', { id: s.id })
      setSignals((prev) => prev.filter((x) => x.id !== s.id))
      toast('Signal deleted')
    } catch {
      toast('Could not delete the signal', 'error')
    }
  }

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fade-in">
      <PageHeader title="Signals" subtitle={`${counts.ACTIVE} active signal${counts.ACTIVE === 1 ? '' : 's'}`} actions={<Button icon="plus" onClick={openNew}>New signal</Button>} />

      <div className="mb-4">
        <FilterTabs value={filter} onChange={setFilter} options={[{ key: 'ACTIVE', label: 'Active', count: counts.ACTIVE }, { key: 'CLOSED', label: 'Closed', count: counts.ALL - counts.ACTIVE }, { key: 'ALL', label: 'All', count: counts.ALL }]} />
      </div>

      {loading ? <SkeletonList rows={4} height={120} /> : error ? (
        <ErrorState description={error} action={<Button variant="secondary" icon="refresh" onClick={reload}>Retry</Button>} />
      ) : shown.length === 0 ? (
        <EmptyState icon="bolt" title="No signals here" action={<Button icon="plus" onClick={openNew}>Publish a signal</Button>} />
      ) : (
        <div className="flex flex-col gap-3">
          {shown.map((s) => {
            const buy = s.direction === 'BUY'
            return (
              <article key={s.id} className="card-flat p-4" style={{ boxShadow: 'var(--rs-shadow-xs)' }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1 self-stretch rounded-full" style={{ background: buy ? 'var(--rs-success)' : 'var(--rs-danger)' }} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-ink font-bold">{s.pair}</span>
                        <span className={`pill ${buy ? 'pill-solid-success' : 'pill-solid-danger'}`}>{s.direction}</span>
                        <StatusPill status={s.status} />
                      </div>
                      <div className="text-dim text-xs mt-1">{formatDateTime(s.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="ghost" icon="edit" onClick={() => openEdit(s)} aria-label="Edit signal">Edit</Button>
                    <Button size="sm" variant="ghost" icon="trash" onClick={() => remove(s)} aria-label="Delete signal" />
                  </div>
                </div>

                <dl className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
                  {([['Entry', s.entry], ['TP1', s.tp1], ['TP2', s.tp2], ['TP3', s.tp3], ['SL', s.sl]] as [string, number | null][]).map(([l, v]) => (
                    <div key={l} className="level"><dt className="level-label">{l}</dt><dd className="level-value">{v != null ? formatPrice(v, s.pair) : '—'}</dd></div>
                  ))}
                  <div className="level"><dt className="level-label">Pips</dt><dd className="level-value">{s.pips ?? '—'}</dd></div>
                </dl>
                {s.notes ? <p className="text-muted text-sm mt-3">{s.notes}</p> : null}

                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t hairline">
                  {s.status === 'ACTIVE' ? (
                    <>
                      <Button size="sm" variant="success-soft" icon="check" onClick={() => updateStatus(s, 'HIT_TP')}>TP hit</Button>
                      <Button size="sm" variant="danger-soft" icon="close" onClick={() => updateStatus(s, 'HIT_SL')}>SL hit</Button>
                      <Button size="sm" variant="secondary" onClick={() => updateStatus(s, 'CLOSED')}>Close</Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" icon="refresh" onClick={() => updateStatus(s, 'ACTIVE')}>Reopen</Button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Publish new signal' : 'Edit signal'} width={560}>
        <form onSubmit={save} className="grid grid-cols-2 gap-3">
          <F label="Pair" htmlFor="s-pair"><select id="s-pair" className="field" value={form.pair} onChange={set('pair')}>{PAIRS.map((p) => <option key={p}>{p}</option>)}{!PAIRS.includes(form.pair) ? <option>{form.pair}</option> : null}</select></F>
          <F label="Direction" htmlFor="s-dir">
            <div className="grid grid-cols-2 gap-1.5" id="s-dir">
              {['BUY', 'SELL'].map((d) => (
                <button key={d} type="button" onClick={() => setForm((f) => ({ ...f, direction: d }))} className={`btn btn-sm ${form.direction === d ? (d === 'BUY' ? 'btn-success' : 'btn-danger') : 'btn-secondary'}`} aria-pressed={form.direction === d}>{d}</button>
              ))}
            </div>
          </F>
          {([['Entry', 'entry', true], ['Stop loss', 'sl', true], ['TP1', 'tp1', true], ['TP2 (optional)', 'tp2', false], ['TP3 (optional)', 'tp3', false]] as [string, keyof typeof EMPTY, boolean][]).map(([label, key, req]) => (
            <F key={key} label={label} htmlFor={`s-${key}`}><input id={`s-${key}`} className="field num" type="number" step="any" placeholder="0.00000" value={form[key]} onChange={set(key)} required={req} /></F>
          ))}
          <F label="Analysis notes" htmlFor="s-notes" className="col-span-2"><textarea id="s-notes" className="field" rows={3} value={form.notes} onChange={set('notes')} placeholder="Trade rationale…" /></F>
          <div className="col-span-2 flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" loading={saving} icon={editing === 'new' ? 'send' : 'check'}>{editing === 'new' ? 'Publish & notify' : 'Save changes'}</Button>
          </div>
          {editing === 'new' ? <p className="col-span-2 text-dim text-xs inline-flex items-center gap-1.5"><Icon name="bell" size={13} /> Publishing sends a push notification to every registered device.</p> : null}
        </form>
      </Modal>
    </div>
  )
}
