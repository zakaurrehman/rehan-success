import Constants from 'expo-constants'

const extra = (Constants.expoConfig?.extra ?? {}) as { websiteUrl?: string; supportEmail?: string }

export const BRAND_NAME = 'Rehan Success'
export const WEBSITE_URL = extra.websiteUrl || 'https://www.rehansuccess.com'
export const WEBSITE_HOST = WEBSITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '')
export const SUPPORT_EMAIL = extra.supportEmail || 'support@rehansuccess.com'
