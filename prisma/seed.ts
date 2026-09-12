import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  console.log('Seeding Rehan Success database...')

  // Admin account — change the password immediately after first login.
  const existing = await prisma.user.findUnique({ where: { username: 'admin' } })
  if (!existing) {
    const hashed = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'admin123', 12)
    await prisma.user.create({
      data: {
        fullName: 'Rehan Success Admin',
        email: 'admin@rehansuccess.com',
        username: 'admin',
        password: hashed,
        role: 'ADMIN',
        status: 'APPROVED',
        plan: 'PREMIUM',
        studentId: 'RS00001'
      }
    })
    console.log('Admin created - username: admin')
  }

  const months = [
    { month: 'Aug 2026', winRate: 82, totalSignals: 34, pipsGained: 2850, pipsLost: 380 },
    { month: 'Jul 2026', winRate: 78, totalSignals: 41, pipsGained: 3200, pipsLost: 520 },
    { month: 'Jun 2026', winRate: 85, totalSignals: 29, pipsGained: 2100, pipsLost: 280 }
  ]
  for (const m of months) {
    const found = await prisma.signalStat.findFirst({ where: { month: m.month } })
    if (!found) await prisma.signalStat.create({ data: m })
  }
  console.log('Signal stats seeded')

  const existingSignal = await prisma.signal.findFirst()
  if (!existingSignal) {
    await prisma.signal.create({
      data: { pair: 'XAU/USD', direction: 'BUY', entry: 2385.0, tp1: 2395.0, tp2: 2408.0, sl: 2370.0, notes: 'Strong demand zone. DXY weakening. Target 2395-2408.', status: 'ACTIVE' }
    })
    await prisma.signal.create({
      data: { pair: 'GBP/USD', direction: 'SELL', entry: 1.2685, tp1: 1.262, tp2: 1.255, sl: 1.274, notes: 'Bearish OB rejection. H4 liquidity sweep complete.', status: 'ACTIVE' }
    })
    console.log('Sample signals seeded')
  }

  const existingReview = await prisma.review.findFirst()
  if (!existingReview) {
    await prisma.review.createMany({
      data: [
        { clientName: 'Ahmed K.', rating: 5, content: 'The signals are incredibly accurate. Made back my subscription in the first week!', status: 'APPROVED' },
        { clientName: 'Maria L.', rating: 5, content: 'The ICT concepts taught here transformed my trading. 80%+ win rate this month.', status: 'APPROVED' },
        { clientName: 'James T.', rating: 4, content: 'Great community and educational content. The live sessions are very insightful.', status: 'APPROVED' }
      ]
    })
    console.log('Sample reviews seeded')
  }

  console.log('Seeding complete!')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
