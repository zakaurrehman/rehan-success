import Constants from 'expo-constants'
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  setAccessToken,
  clearTokens,
} from './tokenStore'

export const API_URL: string =
  (Constants.expoConfig?.extra?.apiUrl as string) || 'http://localhost:3000'

export class ApiError extends Error {
  status: number
  data: unknown
  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.status = status
    this.data = data
  }
}

// AuthContext registers a handler so a failed refresh forces a logout.
let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn
}

// Single-flight refresh so concurrent 401s only refresh once.
let refreshPromise: Promise<boolean> | null = null

async function doRefresh(): Promise<boolean> {
  const refreshToken = await getRefreshToken()
  if (!refreshToken) return false
  try {
    const res = await fetch(`${API_URL}/api/mobile/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return false
    const data = (await res.json()) as { accessToken: string; refreshToken?: string }
    if (data.refreshToken) {
      await setTokens(data.accessToken, data.refreshToken)
    } else {
      await setAccessToken(data.accessToken)
    }
    return true
  } catch {
    return false
  }
}

function refreshTokens(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  auth?: boolean
  retry?: boolean
}

/**
 * Typed API client. Attaches the Bearer token; on 401 transparently
 * refreshes once and retries, otherwise forces logout.
 */
export async function apiFetch<T = unknown>(
  path: string,
  opts: FetchOptions = {}
): Promise<T> {
  const { method = 'GET', body, auth = true, retry = true } = opts

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = await getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && auth && retry) {
    const ok = await refreshTokens()
    if (ok) return apiFetch<T>(path, { ...opts, retry: false })
    await clearTokens()
    onUnauthorized?.()
    throw new ApiError(401, 'Session expired')
  }

  const text = await res.text()
  const data = text ? safeJson(text) : null

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'error' in data
        ? String((data as { error: unknown }).error)
        : null) || `Request failed (${res.status})`
    throw new ApiError(res.status, message, data)
  }

  return data as T
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

// ---- Auth-specific calls (no bearer / special handling) ----

export async function loginRequest(username: string, password: string) {
  const res = await fetch(`${API_URL}/api/mobile/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(res.status, data?.error || 'Login failed', data)
  }
  return data as {
    accessToken: string
    refreshToken: string
    user: import('@/types').AuthUser
  }
}

export async function logoutRequest() {
  const refreshToken = await getRefreshToken()
  if (refreshToken) {
    await fetch(`${API_URL}/api/mobile/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {})
  }
}
