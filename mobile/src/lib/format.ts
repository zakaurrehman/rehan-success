// Mirrors the web app's lib/utils.ts so formatting matches across platforms.

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date))
}

export function timeAgo(date: Date | string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

/** Display-only price precision: JPY 3dp, gold/indices/oil 2dp, majors 5dp. */
export function formatPrice(value: number, pair?: string): string {
  const p = (pair || '').toUpperCase()
  if (p.includes('JPY')) return value.toFixed(3)
  if (p.includes('XAU') || p.includes('US30') || p.includes('NAS') || p.includes('OIL') || value >= 100) return value.toFixed(2)
  return value.toFixed(5)
}

// Service catalogue — identical to the web app's SERVICES.
export const SERVICES = [
  { name: 'Basic Training', price: 30.16, description: 'Entry-level Forex fundamentals', features: ['Market basics', 'Chart reading', 'Risk management intro', 'Email support'] },
  { name: 'Advanced Trading Strategies', price: 102.96, description: 'Pro-level trading strategies', features: ['ICT concepts', 'Smart money', 'Live trade examples', 'Weekly Q&A'], popular: true },
  { name: 'Mastery Bundle', price: 123.76, description: 'Complete trading mastery', features: ['All Advanced features', 'COT research', 'Personal feedback', 'Lifetime access'], bestValue: true },
  { name: 'Premium Signals', price: 50.96, description: 'Monthly live signal alerts', features: ['Daily BUY/SELL signals', 'Entry/TP/SL levels', 'Telegram alerts', 'Signal history'], monthly: true },
  { name: 'Personal Mentorship', price: 206.96, description: '1-on-1 coaching sessions', features: ['4 sessions/month', 'Custom strategy', 'Trade reviews', 'WhatsApp access'] },
  { name: 'Trading Bot', price: 0, description: 'Automated trading assistant', features: ['Auto-execute signals', 'Risk management', 'MT4/MT5 compatible', 'Coming Soon'], comingSoon: true },
] as const
