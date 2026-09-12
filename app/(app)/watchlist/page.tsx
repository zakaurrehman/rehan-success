import type { Metadata } from 'next'
import { PageHeader } from '@/components/ui/states'
import { MarketOverview, MiniChart } from './TradingViewWidgets'

export const metadata: Metadata = { title: 'Markets' }

const PAIRS = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', tv: 'FX:EURUSD' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', tv: 'FX:GBPUSD' },
  { symbol: 'XAU/USD', name: 'Gold / US Dollar', tv: 'OANDA:XAUUSD' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', tv: 'FX:USDJPY' },
  { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', tv: 'FX:GBPJPY' },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', tv: 'FX:USDCAD' },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', tv: 'FX:AUDUSD' },
  { symbol: 'USOIL', name: 'Crude Oil (WTI)', tv: 'TVC:USOIL' },
]

export default function WatchlistPage() {
  return (
    <div className="fade-in">
      <PageHeader title="Markets" subtitle="Live prices for the instruments we trade, powered by TradingView." />

      <section className="card !p-0 overflow-hidden mb-6">
        <MarketOverview />
      </section>

      <h2 className="section-title mb-3">Tracked instruments</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {PAIRS.map((p) => (
          <div key={p.symbol} className="card-flat !p-0 overflow-hidden" style={{ boxShadow: 'var(--rs-shadow-xs)' }}>
            <div className="flex items-center justify-between px-4 pt-3.5">
              <div>
                <div className="num text-ink font-semibold">{p.symbol}</div>
                <div className="text-dim text-xs">{p.name}</div>
              </div>
            </div>
            <MiniChart symbol={p.tv} />
          </div>
        ))}
      </div>
      <p className="text-dim text-xs mt-6">Market data is provided by TradingView and may be delayed. For information only.</p>
    </div>
  )
}
