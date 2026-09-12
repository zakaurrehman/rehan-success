import React from 'react'
import { View } from 'react-native'
import { WebView } from 'react-native-webview'
import { Screen, T, SectionTitle, useTheme, spacing, radius } from '@/components/ui'

/** TradingView widgets — same data source as the web Markets page, themed to match. */
function overviewHtml(theme: 'light' | 'dark', bg: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>html,body{margin:0;background:${bg}}</style></head><body>
<div class="tradingview-widget-container"><div class="tradingview-widget-container__widget"></div>
<script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js" async>
${JSON.stringify({
  colorTheme: theme, dateRange: '1D', showChart: true, locale: 'en', largeChartUrl: '', isTransparent: true, showSymbolLogo: true, showFloatingTooltip: false, width: '100%', height: 520,
  tabs: [
    { title: 'Forex', symbols: [{ s: 'FX:EURUSD', d: 'EUR/USD' }, { s: 'FX:GBPUSD', d: 'GBP/USD' }, { s: 'FX:USDJPY', d: 'USD/JPY' }, { s: 'OANDA:XAUUSD', d: 'XAU/USD' }, { s: 'FX:GBPJPY', d: 'GBP/JPY' }, { s: 'FX:USDCAD', d: 'USD/CAD' }], originalTitle: 'Forex' },
    { title: 'Commodities', symbols: [{ s: 'TVC:USOIL', d: 'Crude Oil' }, { s: 'TVC:GOLD', d: 'Gold' }, { s: 'TVC:SILVER', d: 'Silver' }], originalTitle: 'Commodities' },
  ],
})}
</script></div></body></html>`
}

function miniHtml(tv: string, theme: 'light' | 'dark') {
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;background:transparent}</style></head><body>
<div class="tradingview-widget-container"><div class="tradingview-widget-container__widget"></div>
<script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js" async>
${JSON.stringify({ symbol: tv, width: '100%', height: 130, locale: 'en', dateRange: '1D', colorTheme: theme, isTransparent: true, autosize: false, noTimeScale: true })}
</script></div></body></html>`
}

const PAIRS = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', tv: 'FX:EURUSD' },
  { symbol: 'XAU/USD', name: 'Gold / US Dollar', tv: 'OANDA:XAUUSD' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', tv: 'FX:GBPUSD' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', tv: 'FX:USDJPY' },
  { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', tv: 'FX:GBPJPY' },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', tv: 'FX:USDCAD' },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', tv: 'FX:AUDUSD' },
  { symbol: 'USOIL', name: 'Crude Oil (WTI)', tv: 'TVC:USOIL' },
]

export default function WatchlistScreen() {
  const { c, isDark } = useTheme()
  const theme = isDark ? 'dark' : 'light'
  return (
    <Screen scroll padded>
      <View style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: radius.lg, overflow: 'hidden' }}>
        <WebView key={theme} originWhitelist={['*']} source={{ html: overviewHtml(theme, c.card) }} style={{ height: 530, backgroundColor: c.card }} javaScriptEnabled domStorageEnabled />
      </View>

      <SectionTitle>Tracked instruments</SectionTitle>
      {PAIRS.map((p) => (
        <View key={p.symbol} style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: radius.lg, marginBottom: spacing.md, overflow: 'hidden' }}>
          <View style={{ paddingHorizontal: spacing.lg, paddingTop: 12 }}>
            <T variant="num">{p.symbol}</T>
            <T variant="tiny">{p.name}</T>
          </View>
          <View style={{ height: 130 }}>
            <WebView key={`${p.tv}-${theme}`} originWhitelist={['*']} source={{ html: miniHtml(p.tv, theme) }} style={{ flex: 1, backgroundColor: 'transparent' }} scrollEnabled={false} javaScriptEnabled />
          </View>
        </View>
      ))}
      <T variant="tiny">Market data by TradingView — may be delayed. Information only.</T>
    </Screen>
  )
}
