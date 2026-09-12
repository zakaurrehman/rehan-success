import type { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { timeAgo } from '@/lib/utils'
import { PageHeader, EmptyState } from '@/components/ui/states'
import { Icon } from '@/components/brand/icons'

export const metadata: Metadata = { title: 'Market research' }

const CATEGORIES = ['All', 'Forex', 'Gold', 'Crypto', 'Stocks', 'Indices', 'Crude Oil']

export default async function ResearchPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const session = await getServerSession(authOptions)
  const { cat } = await searchParams
  const userPlan = session?.user.plan || 'FREE'
  const isPremium = userPlan === 'PREMIUM'

  const posts = await prisma.researchPost.findMany({
    where: { published: true, ...(cat && cat !== 'All' ? { category: cat } : {}) },
    include: { author: { select: { fullName: true } } },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  const activeCat = cat && CATEGORIES.includes(cat) ? cat : 'All'

  return (
    <div className="fade-in">
      <PageHeader
        title="Market research"
        subtitle="Analysis and trade ideas across Forex, Gold, indices and more."
        actions={<span className={`pill ${isPremium ? 'pill-gold' : 'pill-neutral'}`}><Icon name="award" size={12} /> {userPlan}</span>}
      />

      <div className="flex gap-2 mb-5 scroll-x -mx-1 px-1 pb-1" role="tablist" aria-label="Categories">
        {CATEGORIES.map((c) => (
          <Link key={c} href={c === 'All' ? '/research' : `/research?cat=${encodeURIComponent(c)}`} className={`chip ${activeCat === c ? 'chip-active' : ''}`} aria-current={activeCat === c ? 'page' : undefined}>
            {c}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <EmptyState icon="fileText" title="No research in this category yet" description="New analysis is published regularly — check back soon." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post, i) => {
            const locked = post.isPremium && !isPremium
            const featured = i === 0 && activeCat === 'All'
            return (
              <Link
                key={post.id}
                href={locked ? '/order' : `/research/${post.id}`}
                className={`card-flat card-hover overflow-hidden flex flex-col no-underline group ${featured ? 'md:col-span-2 md:flex-row' : ''}`}
                style={{ boxShadow: 'var(--rs-shadow-xs)' }}
              >
                {post.imageUrl ? (
                  <div className={`relative overflow-hidden shrink-0 ${featured ? 'md:w-[46%] h-48 md:h-auto' : 'h-44'}`} style={{ background: 'var(--rs-surface-3)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.imageUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" style={{ filter: locked ? 'blur(6px) saturate(0.7)' : undefined }} />
                  </div>
                ) : null}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="pill pill-primary">{post.category}</span>
                    {post.isPremium ? <span className="pill pill-gold"><Icon name="award" size={11} /> Premium</span> : null}
                  </div>
                  <h2 className={`text-ink font-bold mt-3 leading-snug tracking-tight ${featured ? 'text-xl md:text-2xl' : 'text-[17px]'}`}>{post.title}</h2>
                  {locked ? (
                    <div className="alert alert-gold mt-3 !py-2.5">
                      <Icon name="lock" size={15} />
                      <span><strong className="text-inherit">Premium analysis.</strong> Upgrade to the Premium plan to read.</span>
                    </div>
                  ) : (
                    <p className="text-muted text-sm leading-relaxed mt-2 line-clamp-3">{post.content.slice(0, 220)}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-dim mt-auto pt-4">
                    <span>By {post.author.fullName}</span>
                    <span className="inline-flex items-center gap-1"><Icon name="clock" size={13} /> {timeAgo(post.createdAt)}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
