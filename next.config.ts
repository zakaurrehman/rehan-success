import type { NextConfig } from 'next'

// A variable that exists but is empty (e.g. NEXTAUTH_URL="" in a hosting
// dashboard) makes NextAuth throw "Invalid URL" and fails the whole build.
// Treat empty values as unset so NextAuth falls back to VERCEL_URL.
if (process.env.NEXTAUTH_URL !== undefined && process.env.NEXTAUTH_URL.trim() === '') {
  delete process.env.NEXTAUTH_URL
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
  async redirects() {
    return [{ source: '/landing', destination: '/', permanent: true }]
  },
  async rewrites() {
    // Marketing section deep links render the landing page (the client
    // navbar scrolls to the matching section). Real routes take precedence.
    return [
      { source: '/about', destination: '/' },
      { source: '/signals', destination: '/' },
      { source: '/pricing', destination: '/' },
      { source: '/reviews', destination: '/' },
      { source: '/faq', destination: '/' },
    ]
  },
}

export default nextConfig
