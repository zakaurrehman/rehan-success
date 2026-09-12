import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react'
import {
  apiFetch,
  loginRequest,
  logoutRequest,
  setUnauthorizedHandler,
  API_URL,
} from '@/api/client'
import { setTokens, clearTokens, getAccessToken } from '@/api/tokenStore'
import type { AuthUser, Profile } from '@/types'

type AuthState = {
  user: AuthUser | null
  bootstrapping: boolean
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  refreshProfile: () => Promise<void>
}

export type RegisterPayload = {
  fullName: string
  email: string
  phone?: string
  country?: string
  username: string
  password: string
  paymentMethod?: string
  socialHandle?: string
  referralCode?: string
}

export class PendingApprovalError extends Error {
  constructor() {
    super('PENDING_APPROVAL')
  }
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [bootstrapping, setBootstrapping] = useState(true)
  const signingOut = useRef(false)

  const signOut = useCallback(async () => {
    if (signingOut.current) return
    signingOut.current = true
    try {
      await logoutRequest()
    } finally {
      await clearTokens()
      setUser(null)
      signingOut.current = false
    }
  }, [])

  // A failed token refresh anywhere forces a clean logout.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearTokens().finally(() => setUser(null))
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  // Restore session on cold start.
  useEffect(() => {
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (!token) return
        const me = await apiFetch<Profile>('/api/mobile/auth/me')
        setUser(me)
      } catch {
        await clearTokens()
      } finally {
        setBootstrapping(false)
      }
    })()
  }, [])

  const signIn = useCallback(async (username: string, password: string) => {
    try {
      const data = await loginRequest(username, password)
      await setTokens(data.accessToken, data.refreshToken)
      setUser(data.user)
    } catch (e) {
      const err = e as { status?: number; data?: { error?: string } }
      if (err.status === 403 && err.data?.error === 'PENDING_APPROVAL') {
        throw new PendingApprovalError()
      }
      throw e
    }
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await fetch(`${API_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.error || 'Registration failed')
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    try {
      const me = await apiFetch<Profile>('/api/mobile/auth/me')
      setUser(me)
    } catch {
      /* ignore — interceptor handles auth failures */
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, bootstrapping, signIn, signOut, register, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
