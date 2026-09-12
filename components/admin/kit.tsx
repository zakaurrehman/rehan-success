'use client'
import { useCallback, useEffect, useState, type ReactNode } from 'react'

/* ============================================================================
   Admin toolkit — shared data + form helpers so every admin screen behaves
   the same way (loading, errors, toasts, confirmation).
   ========================================================================== */

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** JSON request helper that throws with the server's error message. */
export async function api<T = unknown>(url: string, method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET', body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data: unknown = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!res.ok) {
    const msg = data && typeof data === 'object' && 'error' in data ? String((data as { error: unknown }).error) : `Request failed (${res.status})`
    throw new ApiError(res.status, msg)
  }
  return data as T
}

/** Loads a list endpoint once and exposes local mutation + reload. */
export function useList<T>(url: string, select?: (raw: unknown) => T[]) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const raw = await api<unknown>(url)
      setData(select ? select(raw) : (raw as T[]))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load data')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  useEffect(() => { reload() }, [reload])
  return { data, setData, loading, error, reload }
}

export function F({ label, htmlFor, hint, children, className = '' }: { label: string; htmlFor?: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="field-label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  )
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer select-none card-sub !py-3">
      <span>
        <span className="block text-ink text-sm font-semibold">{label}</span>
        {description ? <span className="block text-dim text-xs mt-0.5">{description}</span> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative w-11 h-6 rounded-full shrink-0 transition-colors"
        style={{ background: checked ? 'var(--rs-primary)' : 'var(--rs-line-strong)' }}
      >
        <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: checked ? 22 : 2, boxShadow: '0 1px 3px rgba(0,0,0,.25)' }} />
      </button>
    </label>
  )
}

export function FilterTabs<K extends string>({ value, onChange, options }: { value: K; onChange: (v: K) => void; options: { key: K; label: string; count?: number }[] }) {
  return (
    <div className="flex gap-2 scroll-x pb-1" role="tablist">
      {options.map((o) => (
        <button key={o.key} type="button" role="tab" aria-selected={value === o.key} onClick={() => onChange(o.key)} className={`chip ${value === o.key ? 'chip-active' : ''}`}>
          {o.label}
          {o.count !== undefined ? (
            <span className="num text-[11px] px-1.5 rounded-full" style={{ background: value === o.key ? 'rgba(255,255,255,0.22)' : 'var(--rs-surface-3)' }}>{o.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  )
}

/** Convert an ISO timestamp to the value format of <input type="datetime-local">. */
export const toLocalDT = (iso: string) => {
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}
