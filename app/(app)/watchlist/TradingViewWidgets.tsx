'use client'
import { useEffect, useRef, useState } from 'react'

/**
 * TradingView embeds. Scripts are injected in an effect (scripts set through
 * innerHTML never execute on client-side navigation). The widget is created
 * only after the active theme is known, and re-created when it changes.
 */
function useColorTheme(): 'light' | 'dark' | null {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null)
  useEffect(() => {
    const el = document.documentElement
    const sync = () => setTheme(el.getAttribute('data-theme') === 'dark' ? 'dark' : 'light')
    sync()
    const mo = new MutationObserver(sync)
    mo.observe(el, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [])
  return theme
}

function useWidget(src: string, config: Record<string, unknown>) {
  const ref = useRef<HTMLDivElement | null>(null)
  const colorTheme = useColorTheme()
  const configKey = JSON.stringify(config)

  useEffect(() => {
    const host = ref.current
    if (!host || !colorTheme) return
    const inner = document.createElement('div')
    inner.className = 'tradingview-widget-container__widget'
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.type = 'text/javascript'
    script.innerHTML = JSON.stringify({ ...JSON.parse(configKey), colorTheme, isTransparent: true, locale: 'en' })
    host.replaceChildren(inner, script)
    return () => { host.replaceChildren() }
  }, [src, configKey, colorTheme])

  return ref
}

export function MarketOverview() {
  const ref = useWidget('https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js', {
    dateRange: '1D',
    showChart: true,
    largeChartUrl: '',
    showSymbolLogo: true,
    showFloatingTooltip: false,
    width: '100%',
    height: 460,
    tabs: [
      {
        title: 'Forex',
        symbols: [
          { s: 'FX:EURUSD', d: 'EUR/USD' }, { s: 'FX:GBPUSD', d: 'GBP/USD' }, { s: 'FX:USDJPY', d: 'USD/JPY' },
          { s: 'OANDA:XAUUSD', d: 'XAU/USD' }, { s: 'FX:GBPJPY', d: 'GBP/JPY' }, { s: 'FX:USDCAD', d: 'USD/CAD' },
        ],
        originalTitle: 'Forex',
      },
      {
        title: 'Commodities',
        symbols: [{ s: 'TVC:USOIL', d: 'Crude Oil' }, { s: 'TVC:GOLD', d: 'Gold' }, { s: 'TVC:SILVER', d: 'Silver' }],
        originalTitle: 'Commodities',
      },
    ],
  })
  return <div ref={ref} className="tradingview-widget-container min-h-[460px]" />
}

export function MiniChart({ symbol }: { symbol: string }) {
  const ref = useWidget('https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js', {
    symbol,
    width: '100%',
    height: 150,
    dateRange: '1D',
    autosize: false,
    largeChartUrl: '',
    noTimeScale: true,
  })
  return <div ref={ref} className="tradingview-widget-container h-[150px]" />
}
