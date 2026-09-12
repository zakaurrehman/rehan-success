import { Platform } from 'react-native'
import type { Plan, ResourceTier } from '@/types'

/** Ascending access order — must match the backend Plan enum order. */
export const PLAN_ORDER: Plan[] = ['FREE', 'BASIC', 'ADVANCED', 'MASTERY', 'PREMIUM', 'MENTORSHIP']

export function planRank(plan: Plan | string | undefined | null): number {
  if (!plan) return 0
  const i = PLAN_ORDER.indexOf(plan as Plan)
  return i < 0 ? 0 : i
}

/**
 * Apple App Store compliance: iOS apps cannot unlock digital content bought
 * outside the app (no IAP). On iOS premium content is always locked and list
 * screens hide premium items entirely via `IS_IOS_FREE_ONLY`.
 * On Android the platform rule applies — premium unlocks for the PREMIUM plan.
 */
export const IS_IOS_FREE_ONLY = Platform.OS === 'ios'

export function canViewPremium(plan: Plan): boolean {
  if (IS_IOS_FREE_ONLY) return false
  return plan === 'PREMIUM'
}

export function isLocked(isPremium: boolean, plan: Plan): boolean {
  return isPremium && !canViewPremium(plan)
}

/**
 * Resource tiers (same rule as the web app and API): FREE for everyone,
 * BASIC needs any paid plan, PREMIUM needs Advanced or above.
 * On iOS only the FREE tier is accessible.
 */
export function canAccessResource(tier: ResourceTier, plan: Plan): boolean {
  if (IS_IOS_FREE_ONLY) return tier === 'FREE'
  if (tier === 'FREE') return true
  if (tier === 'BASIC') return planRank(plan) >= planRank('BASIC')
  return planRank(plan) >= planRank('ADVANCED')
}
