'use client'
import { useEffect, useState } from 'react'
import { Icon } from '@/components/brand/icons'

export type ThemeMode = 'light' | 'dark'
const KEY = 'rs-theme'

/** Inline script (runs before paint) — prevents a flash of the wrong theme. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${KEY}');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','light')}})();`

export function useTheme(): [ThemeMode, (m: ThemeMode) => void] {
  const [mode, setMode] = useState<ThemeMode>('light')
  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme')
    setMode(current === 'dark' ? 'dark' : 'light')
  }, [])
  const apply = (m: ThemeMode) => {
    document.documentElement.setAttribute('data-theme', m)
    try { localStorage.setItem(KEY, m) } catch { /* private mode */ }
    setMode(m)
  }
  return [mode, apply]
}

export default function ThemeToggle({ className = '', withLabel = false }: { className?: string; withLabel?: boolean }) {
  const [mode, setMode] = useTheme()
  const next = mode === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      onClick={() => setMode(next)}
      className={`btn btn-ghost ${withLabel ? 'btn-sm justify-start' : 'btn-sm btn-icon'} ${className}`}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      <Icon name={mode === 'dark' ? 'sun' : 'moon'} size={18} />
      {withLabel ? <span>{mode === 'dark' ? 'Light mode' : 'Dark mode'}</span> : null}
    </button>
  )
}
