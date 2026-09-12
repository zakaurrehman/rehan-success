import type { Metadata, Viewport } from 'next'
import { Manrope, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { themeInitScript } from '@/components/ui/ThemeToggle'
import { BRAND, SITE_URL, SOCIALS, STORES } from '@/lib/site'

const display = Manrope({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-display', display: 'swap' })
const body = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-mono', display: 'swap' })

const TITLE = `${BRAND.name} | Forex Signals, ICT Education & Market Research`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s · ${BRAND.name}` },
  description: BRAND.description,
  applicationName: BRAND.name,
  keywords: ['forex trading', 'forex signals', 'smart money concepts', 'ICT trading', 'gold trading', 'market analysis', 'trading education'],
  creator: BRAND.name,
  publisher: BRAND.name,
  alternates: { canonical: SITE_URL },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: TITLE,
    description: BRAND.description,
    url: SITE_URL,
    siteName: BRAND.name,
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: BRAND.name }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: BRAND.description, images: ['/og.png'] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  ...(STORES.iosAppId ? { itunes: { appId: STORES.iosAppId } } : {}),
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f7fa' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1020' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: BRAND.name,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/icon-512.png`,
  description: BRAND.description,
  sameAs: Object.values(SOCIALS).filter(Boolean),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
