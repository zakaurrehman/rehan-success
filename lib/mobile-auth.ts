import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import jwt from 'jsonwebtoken'
import { createHash, randomBytes } from 'crypto'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Shared mobile/web auth layer.
 *
 * Mobile clients send `Authorization: Bearer <accessToken>`.
 * Web clients keep using the existing NextAuth cookie/session.
 * `getAuthSession()` resolves EITHER into the same shape the existing
 * route code already expects from `getServerSession` so business logic
 * does not need to change.
 */

const JWT_SECRET = process.env.NEXTAUTH_SECRET as string
if (!JWT_SECRET) {
  // Fail loud at import time in dev; never silently sign with an empty key.
  console.error('[mobile-auth] NEXTAUTH_SECRET is not set — mobile auth will reject all tokens')
}

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60 // 15 minutes
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export type AppSessionUser = {
  id: string
  role: string
  plan: string
  studentId: string
  name?: string | null
  email?: string | null
}

export type AppSession = { user: AppSessionUser }

type AccessTokenPayload = {
  sub: string
  role: string
  plan: string
  studentId: string
  type: 'access'
}

// ---------- Access tokens (stateless JWT) ----------

export function signAccessToken(user: {
  id: string
  role: string
  plan: string
  studentId: string
}): string {
  const payload: AccessTokenPayload = {
    sub: user.id,
    role: user.role,
    plan: user.plan,
    studentId: user.studentId,
    type: 'access',
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL_SECONDS })
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AccessTokenPayload
    if (decoded.type !== 'access') return null
    return decoded
  } catch {
    return null
  }
}

// ---------- Refresh tokens (opaque, hashed at rest) ----------

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex')
}

export async function issueRefreshToken(userId: string): Promise<string> {
  const raw = randomBytes(48).toString('hex')
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
  await prisma.mobileRefreshToken.create({
    data: { userId, tokenHash: hashToken(raw), expiresAt },
  })
  return raw
}

/**
 * Validates and rotates a refresh token. Returns the userId on success.
 * The presented token is always consumed (single-use rotation).
 */
export async function rotateRefreshToken(rawToken: string): Promise<string | null> {
  const record = await prisma.mobileRefreshToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  })
  if (!record) return null
  // Always consume the presented token.
  await prisma.mobileRefreshToken.delete({ where: { id: record.id } }).catch(() => {})
  if (record.expiresAt.getTime() < Date.now()) return null
  return record.userId
}

export async function revokeRefreshToken(rawToken: string): Promise<void> {
  await prisma.mobileRefreshToken
    .deleteMany({ where: { tokenHash: hashToken(rawToken) } })
    .catch(() => {})
}

export async function revokeAllRefreshTokens(userId: string): Promise<void> {
  await prisma.mobileRefreshToken.deleteMany({ where: { userId } }).catch(() => {})
}

// ---------- Shared session resolver ----------

function getBearerToken(req: NextRequest | Request): string | null {
  const header = req.headers.get('authorization') || req.headers.get('Authorization')
  if (!header) return null
  const [scheme, value] = header.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !value) return null
  return value.trim()
}

/**
 * Resolves the current session from EITHER a mobile Bearer token OR the
 * existing NextAuth web cookie. Returns the same `{ user: {...} }` shape
 * `getServerSession(authOptions)` returns, or null when unauthenticated.
 */
export async function getAuthSession(
  req?: NextRequest | Request
): Promise<AppSession | null> {
  if (req) {
    const bearer = getBearerToken(req)
    if (bearer) {
      const payload = verifyAccessToken(bearer)
      if (!payload) return null
      return {
        user: {
          id: payload.sub,
          role: payload.role,
          plan: payload.plan,
          studentId: payload.studentId,
        },
      }
    }
  }
  // Fall back to the existing web cookie session — unchanged behavior.
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  return session as unknown as AppSession
}
