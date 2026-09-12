'use client'
import { useState, useEffect } from 'react'
import { Icon } from '@/components/brand/icons'

export default function CountdownTimer() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let end = 0
    try { end = Number(localStorage.getItem('rs_offer_end') || 0) } catch { /* storage blocked */ }
    if (!end || end < Date.now()) {
      end = Date.now() + 47 * 3600_000 + 23 * 60_000 + 11_000
      try { localStorage.setItem('rs_offer_end', end.toString()) } catch { /* storage blocked */ }
    }
    const tick = () => {
      const rem = Math.max(0, end - Date.now())
      setTime({ h: Math.floor(rem / 3600_000), m: Math.floor((rem % 3600_000) / 60_000), s: Math.floor((rem % 60_000) / 1000) })
      setReady(true)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <div className="inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl px-4 py-2.5 border" style={{ background: 'var(--rs-gold-tint)', borderColor: 'var(--rs-gold-line)' }}>
      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: 'var(--rs-gold-text)' }}>
        <Icon name="clock" size={15} /> Launch pricing ends in
      </span>
      <div className="flex items-center gap-1.5" style={{ visibility: ready ? 'visible' : 'hidden' }} aria-live="off">
        {([['h', time.h], ['m', time.m], ['s', time.s]] as [string, number][]).map(([label, val], i) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="num text-ink font-semibold text-base rounded-md px-1.5 py-0.5" style={{ background: 'var(--rs-surface)' }}>
              {pad(val)}<span className="text-dim text-[10px] ml-0.5">{label}</span>
            </span>
            {i < 2 && <span className="text-dim">:</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
