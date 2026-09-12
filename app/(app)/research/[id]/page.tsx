import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDateTime } from '@/lib/utils'
import { Icon } from '@/components/brand/icons'
import { Avatar } from '@/components/ui/states'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default async function ResearchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const post = await prisma.researchPost.findUnique({ where: { id }, include: { author: { select: { fullName: true } } } })
  if (!post || !post.published) notFound()

  const locked = post.isPremium && session?.user.plan !== 'PREMIUM'

  return (
    <article className="fade-in max-w-3xl">
      <Link href="/research" className="link-muted inline-flex items-center gap-1 text-[13px] font-medium mb-4">
        <Icon name="chevronLeft" size={16} /> Research
      </Link>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="pill pill-primary">{post.category}</span>
        {post.isPremium ? <span className="pill pill-gold"><Icon name="award" size={11} /> Premium</span> : null}
      </div>
      <h1 className="text-[clamp(1.6rem,3.6vw,2.3rem)] font-extrabold mt-3 leading-tight">{post.title}</h1>
      <div className="flex items-center gap-3 mt-4 pb-5 border-b hairline">
        <Avatar name={post.author.fullName} size={36} />
        <div>
          <div className="text-ink text-sm font-semibold">{post.author.fullName}</div>
          <div className="text-dim text-xs">{formatDateTime(post.createdAt)}</div>
        </div>
      </div>

      {post.imageUrl && !locked ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.imageUrl} alt="" className="w-full rounded-2xl mt-6 border hairline" loading="lazy" decoding="async" />
      ) : null}

      {locked ? (
        <div className="card text-center py-12 mt-6">
          <span className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--rs-gold-tint)', color: 'var(--rs-gold-text)' }}><Icon name="lock" size={24} /></span>
          <h2 className="text-lg font-bold mt-4">This analysis is for Premium members</h2>
          <p className="text-muted text-sm mt-1.5 max-w-sm mx-auto">Upgrade your plan to unlock premium research, courses and resources.</p>
          <div className="mt-6"><Button href="/order" variant="gold" icon="sparkles">View plans</Button></div>
        </div>
      ) : (
        <div className="text-text text-base leading-[1.85] whitespace-pre-wrap mt-6">{post.content}</div>
      )}

      <p className="text-dim text-xs leading-relaxed mt-10 pt-5 border-t hairline">Educational analysis only — not financial advice. Trading carries a high risk of loss.</p>
    </article>
  )
}
