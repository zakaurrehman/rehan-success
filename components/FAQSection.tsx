'use client'
import { useState } from 'react'
import { Icon } from '@/components/brand/icons'

const FAQS = [
  { q: 'Which markets do the signals cover?', a: 'We focus on XAU/USD (Gold), EUR/USD, GBP/USD, USD/JPY, GBP/JPY and USD/CHF. Gold is our most actively traded instrument.' },
  { q: 'What timeframes are the signals based on?', a: 'Signals come from H1, H4 and Daily analysis using ICT (Inner Circle Trader) and Smart Money Concepts — institutional order flow, liquidity sweeps and market structure.' },
  { q: 'How are signals delivered?', a: 'Every signal is published instantly on the Live Signals desk in the web and mobile apps, with push notifications on mobile. Each one includes Entry, TP1, TP2 and Stop Loss levels.' },
  { q: 'Do I need a specific broker?', a: 'No. Signals work with any regulated Forex broker. Look for low spreads on Gold and major pairs — our Brokers page lists options we have reviewed.' },
  { q: 'What account size do you recommend?', a: 'We suggest $200–$500 minimum for following signals. Course students can start on a demo account. Every plan teaches proper risk management (1–2% per trade).' },
  { q: 'What methodology do you teach?', a: 'ICT concepts combined with Smart Money Concepts: order blocks, fair value gaps, liquidity pools and market-structure shifts, from beginner to advanced.' },
  { q: 'How do I get access after paying?', a: 'Once our team confirms your payment, your account is upgraded automatically and all included content unlocks in the Classroom, Research and Signals sections.' },
  { q: 'Can I get a refund?', a: 'Because our products are digital, refunds are not offered once course access has been granted. Signal subscriptions can be cancelled before the next billing cycle.' },
]

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="flex flex-col gap-2.5">
      {FAQS.map((faq, i) => {
        const isOpen = open === i
        return (
          <div key={faq.q} className="rounded-2xl overflow-hidden border transition-colors" style={{ background: 'var(--rs-surface)', borderColor: isOpen ? 'var(--rs-primary-line)' : 'var(--rs-line)' }}>
            <h3>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-sans"
                aria-expanded={isOpen}
                aria-controls={`faq-${i}`}
              >
                <span className="text-ink font-semibold text-[15px] leading-snug tracking-normal">{faq.q}</span>
                <span className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-300"
                      style={{ background: isOpen ? 'var(--rs-primary)' : 'var(--rs-surface-2)', color: isOpen ? 'var(--rs-primary-fg)' : 'var(--rs-muted)', transform: isOpen ? 'rotate(45deg)' : 'none' }}>
                  <Icon name="plus" size={16} />
                </span>
              </button>
            </h3>
            <div id={`faq-${i}`} className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-muted text-sm leading-relaxed">{faq.a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
