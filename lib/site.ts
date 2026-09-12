/**
 * Single source of truth for brand identity + external links.
 * Everything here is driven by env so a deployment can change contact
 * details without touching source. Empty links are hidden by the UI.
 */
export const BRAND = {
  name: 'Rehan Success',
  tagline: 'Disciplined trading. Lasting success.',
  description:
    'Rehan Success is a professional Forex education and live-signals platform: ICT & Smart Money courses, daily BUY/SELL signals, market research, and a global community of traders.',
  mentorName: 'Rehan',
  mentorTitle: 'Professional Forex Trader & Mentor',
} as const

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rehansuccess.com').replace(/\/$/, '')
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@rehansuccess.com'
export const SUPPORT_WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || ''

export const SOCIALS = {
  instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || '',
  telegram: process.env.NEXT_PUBLIC_SOCIAL_TELEGRAM || '',
  youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || '',
  whatsapp: process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP || '',
} as const

export const STORES = {
  ios: process.env.NEXT_PUBLIC_IOS_APP_URL || '',
  iosAppId: process.env.NEXT_PUBLIC_IOS_APP_ID || '',
  android: process.env.NEXT_PUBLIC_ANDROID_APP_URL || '',
} as const
