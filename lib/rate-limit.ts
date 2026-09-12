/**
 * Minimal in-memory fixed-window rate limiter.
 * Good enough to blunt credential-stuffing on the login endpoint.
 * (For multi-instance production, back this with Redis/Upstash — the
 *  interface stays the same.)
 */

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

export function rateLimit(
  key: string,
  limit = 8,
  windowMs = 60_000
): { ok: boolean; retryAfter: number } {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }

  existing.count += 1
  if (existing.count > limit) {
    return { ok: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) }
  }
  return { ok: true, retryAfter: 0 }
}

export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

// Opportunistically evict stale buckets so the map can't grow unbounded.
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k)
}, 5 * 60_000).unref?.()
