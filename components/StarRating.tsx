'use client'
import { useState } from 'react'

const STAR = 'var(--rs-gold)'
const POINTS = '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'

export function StarDisplay({ rating, size = 15 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" style={{ fill: i <= rating ? STAR : 'transparent', stroke: i <= rating ? STAR : 'var(--rs-faint)' }} strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
          <polygon points={POINTS} />
        </svg>
      ))}
    </div>
  )
}

export function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1.5" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((i) => {
        const on = i <= (hover || value)
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} star${i > 1 ? 's' : ''}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(i)}
            className="p-0.5 rounded-md transition-transform"
            style={{ transform: on ? 'scale(1.06)' : 'none' }}
          >
            <svg width={30} height={30} viewBox="0 0 24 24" style={{ fill: on ? STAR : 'transparent', stroke: on ? STAR : 'var(--rs-faint)' }} strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
              <polygon points={POINTS} />
            </svg>
          </button>
        )
      })}
    </div>
  )
}
