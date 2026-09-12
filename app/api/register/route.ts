import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateStudentId, generateReferralCode } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, phone, country, username, password, paymentMethod, socialHandle } = await req.json()

    if (!fullName || !email || !username || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } })
    if (existing) {
      return NextResponse.json({ error: 'Email or username already in use' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 12)
    const studentId = generateStudentId()
    const referralCode = generateReferralCode(username)

    const user = await prisma.user.create({
      data: { fullName, email, phone, country, username, password: hashed, paymentMethod, socialHandle, role: 'AFFILIATE', status: 'PENDING', studentId, referralCode }
    })

    return NextResponse.json({ id: user.id }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
