import type { IconName } from '@/components/brand/icons'

export type NavLink = { href: string; label: string; icon: IconName; live?: boolean }
export type NavGroup = { title: string; links: NavLink[] }

/** Authenticated member navigation — single source for sidebar + mobile menu. */
export const APP_NAV: NavGroup[] = [
  {
    title: 'Trade',
    links: [
      { href: '/dashboard', label: 'Overview', icon: 'home' },
      { href: '/signals', label: 'Live Signals', icon: 'bolt', live: true },
      { href: '/watchlist', label: 'Markets', icon: 'trendingUp' },
      { href: '/research', label: 'Research', icon: 'fileText' },
      { href: '/calendar', label: 'Economic Calendar', icon: 'calendar' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { href: '/classroom', label: 'Classroom', icon: 'graduation' },
      { href: '/live', label: 'Live Sessions', icon: 'radio' },
      { href: '/community', label: 'Community', icon: 'users' },
      { href: '/resources', label: 'Resources', icon: 'layers' },
    ],
  },
  {
    title: 'Tools & Account',
    links: [
      { href: '/calculator', label: 'Risk Calculator', icon: 'calculator' },
      { href: '/brokers', label: 'Brokers', icon: 'building' },
      { href: '/affiliate', label: 'Affiliate', icon: 'gift' },
      { href: '/notifications', label: 'Notifications', icon: 'bell' },
      { href: '/profile', label: 'Profile', icon: 'user' },
    ],
  },
]

/** Mobile bottom navigation (5 slots, signals centred). */
export const BOTTOM_NAV: NavLink[] = [
  { href: '/dashboard', label: 'Home', icon: 'home' },
  { href: '/research', label: 'Research', icon: 'fileText' },
  { href: '/signals', label: 'Signals', icon: 'bolt', live: true },
  { href: '/classroom', label: 'Learn', icon: 'graduation' },
  { href: '/community', label: 'Community', icon: 'users' },
]

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/')
}
