/**
 * Plan-based access rules shared by pages and API routes.
 * Order must match the Prisma `Plan` enum.
 */
export const PLAN_ORDER = ['FREE', 'BASIC', 'ADVANCED', 'MASTERY', 'PREMIUM', 'MENTORSHIP'] as const

export function planRank(plan: string | null | undefined): number {
  const i = PLAN_ORDER.indexOf((plan || 'FREE') as (typeof PLAN_ORDER)[number])
  return i < 0 ? 0 : i
}

/** Premium research / courses unlock for the PREMIUM plan (existing rule). */
export function canViewPremium(plan: string | null | undefined): boolean {
  return plan === 'PREMIUM'
}

/**
 * Resource tiers: FREE for everyone, BASIC needs any paid plan,
 * PREMIUM needs Advanced or above. Same rule on web and mobile.
 */
export function canAccessResource(tier: string, plan: string | null | undefined): boolean {
  if (tier === 'FREE') return true
  if (tier === 'BASIC') return planRank(plan) >= planRank('BASIC')
  return planRank(plan) >= planRank('ADVANCED')
}
