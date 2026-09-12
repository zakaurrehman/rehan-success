import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const response = NextResponse.redirect(`${appUrl}/landing`)
  response.cookies.set('ref_code', code, { httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: '/' })
  return response
}
