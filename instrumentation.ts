/**
 * Runs once when a server instance starts, before any route is loaded.
 * An empty NEXTAUTH_URL makes NextAuth throw "Invalid URL" on every page, so
 * treat it as unset (NextAuth then falls back to VERCEL_URL on Vercel).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NEXTAUTH_URL !== undefined && process.env.NEXTAUTH_URL.trim() === '') {
    delete process.env.NEXTAUTH_URL
  }
  if (process.env.NEXT_RUNTIME === 'nodejs' && !process.env.NEXTAUTH_SECRET) {
    console.error('[config] NEXTAUTH_SECRET is not set — sign-in will not work until it is added.')
  }
}
