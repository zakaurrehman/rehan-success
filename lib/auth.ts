import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) return null

          // Accept either username or email so users can sign in with whichever they remember.
          const identifier = credentials.username.trim()
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { username: identifier },
                { email: identifier.toLowerCase() },
              ],
            },
          })

          if (!user) return null

          const valid = await bcrypt.compare(credentials.password, user.password)
          if (!valid) return null

          if (user.role !== 'ADMIN' && user.status !== 'APPROVED') return null

          return {
            id: user.id,
            name: user.fullName,
            email: user.email,
            role: user.role,
            plan: user.plan,
            studentId: user.studentId
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as unknown as { role: string }).role
        token.plan = (user as unknown as { plan: string }).plan
        token.studentId = (user as unknown as { studentId: string }).studentId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.plan = token.plan as string
        session.user.studentId = token.studentId as string
      }
      return session
    }
  }
}
