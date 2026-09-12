import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'
import { canAccessResource } from '@/lib/gating'

export async function GET(req: NextRequest) {
  const session = await getAuthSession(req)
  const resources = await prisma.resource.findMany({ orderBy: [{ tier: 'asc' }, { createdAt: 'desc' }] })
  if (session?.user.role === 'ADMIN') return NextResponse.json(resources)

  // Download links are only returned for tiers the requester can access.
  const plan = session?.user.plan
  return NextResponse.json(resources.map((r) => (canAccessResource(r.tier, plan) ? r : { ...r, fileUrl: '' })))
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession(req)
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, description, fileUrl, category, tier } = await req.json()
  const resource = await prisma.resource.create({ data: { title, description, fileUrl, category, tier } })
  return NextResponse.json(resource, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession(req)
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, title, description, fileUrl, category, tier } = await req.json()
  const resource = await prisma.resource.update({ where: { id }, data: { title, description, fileUrl, category, tier } })
  return NextResponse.json(resource)
}

export async function DELETE(req: NextRequest) {
  const session = await getAuthSession(req)
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await req.json()
  await prisma.resource.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
