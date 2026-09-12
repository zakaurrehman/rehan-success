export type Role = 'USER' | 'AFFILIATE' | 'ADMIN'
export type Plan = 'FREE' | 'BASIC' | 'ADVANCED' | 'MASTERY' | 'PREMIUM' | 'MENTORSHIP'
export type Status = 'PENDING' | 'APPROVED' | 'REJECTED'
export type SignalStatus = 'ACTIVE' | 'HIT_TP' | 'HIT_SL' | 'CLOSED'
export type Impact = 'LOW' | 'MEDIUM' | 'HIGH'
export type ResourceTier = 'FREE' | 'BASIC' | 'PREMIUM'

export type AuthUser = {
  id: string
  fullName: string
  email: string
  role: Role
  plan: Plan
  status: Status
  studentId: string
  referralCode?: string | null
  avatarUrl?: string | null
}

export type Profile = AuthUser & {
  phone?: string | null
  city?: string | null
  country?: string | null
  username?: string
  paymentMethod?: string | null
  socialHandle?: string | null
  bio?: string | null
  createdAt?: string
}

export type Signal = {
  id: string
  pair: string
  direction: 'BUY' | 'SELL'
  entry: number
  tp1: number
  tp2?: number | null
  tp3?: number | null
  sl: number
  status: SignalStatus
  pips?: number | null
  notes?: string | null
  imageUrl?: string | null
  closedAt?: string | null
  createdAt: string
}

export type SignalStat = {
  id: string
  month: string
  winRate: number
  totalSignals: number
  pipsGained: number
  pipsLost: number
}

export type ResearchPost = {
  id: string
  title: string
  category: string
  content: string
  imageUrl?: string | null
  isPremium: boolean
  published: boolean
  createdAt: string
  author?: { fullName: string }
}

export type CommunityPost = {
  id: string
  title: string
  content: string
  imageUrl?: string | null
  createdAt: string
  author: { fullName: string; studentId: string }
  comments: { id: string }[]
  reactions: { type: 'LIKE' | 'DISLIKE' }[]
}

export type Comment = {
  id: string
  content: string
  authorName: string
  studentId: string
  createdAt: string
}

export type Course = {
  id: string
  title: string
  level: string
  description: string
  imageUrl?: string | null
  isPremium: boolean
  videos: { id: string }[]
  certificates?: { id: string }[]
}

export type Video = {
  id: string
  courseId: string
  title: string
  url: string
  duration?: string | null
  isPremium: boolean
}

export type LiveSession = {
  id: string
  title: string
  description?: string | null
  streamUrl?: string | null
  scheduledAt: string
  isLive: boolean
}

export type EconomicEvent = {
  id: string
  name: string
  currency: string
  impact: Impact
  eventTime: string
  actual?: string | null
  forecast?: string | null
  previous?: string | null
}

export type Broker = {
  id: string
  name: string
  description: string
  rating: number
  link: string
  logoUrl?: string | null
  isRecommended: boolean
  minDeposit?: string | null
  regulation?: string | null
}

export type Resource = {
  id: string
  title: string
  description: string
  fileUrl: string
  category: string
  tier: ResourceTier
  downloads: number
}

export type AppNotification = {
  id: string
  title: string
  message: string
  read: boolean
  link?: string | null
  createdAt: string
}

export type Review = {
  id: string
  clientName: string
  rating: number
  content: string
  status: Status
  createdAt: string
}

export type WithdrawalRequest = {
  id: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED'
  note?: string | null
  createdAt: string
}

export type PaymentRequest = {
  id: string
  clientName: string
  clientEmail: string
  service: string
  amount: number
  referralCode?: string | null
  paymentMethod?: string | null
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED'
  rejectedNote?: string | null
  createdAt: string
}
