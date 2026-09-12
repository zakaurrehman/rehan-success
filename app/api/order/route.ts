import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { clientName, clientEmail, phone, country, service, amount, referralCode, paymentMethod, paymentNote } = await req.json()
  const payment = await prisma.paymentRequest.create({
    data: { clientName, clientEmail, phone, country, service, amount: parseFloat(amount), referralCode, paymentMethod, paymentNote }
  })
  return NextResponse.json(payment, { status: 201 })
}
