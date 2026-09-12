import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastMod = new Date('2026-09-01')
  return [
    { url: `${SITE_URL}/`, lastModified: lastMod, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: lastMod, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/signals`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/pricing`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/reviews`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/faq`, lastModified: lastMod, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/privacy`, lastModified: lastMod, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
