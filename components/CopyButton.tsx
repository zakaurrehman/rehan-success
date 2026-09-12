'use client'
import { useState } from 'react'
import { Icon } from '@/components/brand/icons'

export default function CopyButton({ text, label = 'Copy link', block = false }: { text: string; label?: string; block?: boolean }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1800)
        } catch { /* clipboard blocked — the link stays visible for manual copy */ }
      }}
      className={`btn ${copied ? 'btn-success-soft' : 'btn-primary'} ${block ? 'btn-block' : ''}`}
      aria-live="polite"
    >
      <Icon name={copied ? 'check' : 'copy'} size={16} />
      {copied ? 'Copied!' : label}
    </button>
  )
}
