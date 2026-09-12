import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { timeAgo } from '@/lib/utils'
import { PageHeader, EmptyState, Avatar } from '@/components/ui/states'
import { Icon } from '@/components/brand/icons'
import CommunityPostForm from './PostForm'

export const metadata: Metadata = { title: 'Community' }

export default async function CommunityPage() {
  const posts = await prisma.communityPost.findMany({
    include: {
      author: { select: { fullName: true, studentId: true } },
      comments: { select: { id: true } },
      reactions: { select: { type: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  return (
    <div className="fade-in max-w-3xl">
      <PageHeader title="Community" subtitle="Share analysis, ask questions and learn from other traders." />

      <CommunityPostForm />

      {posts.length === 0 ? (
        <EmptyState icon="message" title="No posts yet" description="Start the conversation — share a chart idea or a question." />
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => {
            const likes = post.reactions.filter((r) => r.type === 'LIKE').length
            const dislikes = post.reactions.filter((r) => r.type === 'DISLIKE').length
            return (
              <Link key={post.id} href={`/community/${post.id}`} className="card-flat card-hover block p-5 no-underline" style={{ boxShadow: 'var(--rs-shadow-xs)' }}>
                <div className="flex items-center gap-3">
                  <Avatar name={post.author.fullName} size={38} />
                  <div className="min-w-0">
                    <div className="text-ink text-sm font-semibold truncate">{post.author.fullName}</div>
                    <div className="text-dim text-xs">{post.author.studentId} · {timeAgo(post.createdAt)}</div>
                  </div>
                </div>
                <h2 className="text-ink text-[17px] font-bold mt-3.5 leading-snug tracking-tight">{post.title}</h2>
                <p className="text-muted text-sm leading-relaxed mt-1.5 line-clamp-3">{post.content}</p>
                {post.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.imageUrl} alt="" loading="lazy" decoding="async" className="w-full max-h-72 object-cover rounded-xl mt-3 border hairline" />
                ) : null}
                <div className="flex items-center gap-5 mt-4 pt-3.5 border-t hairline text-dim text-[13px]">
                  <span className="inline-flex items-center gap-1.5"><Icon name="thumbsUp" size={15} /> {likes}</span>
                  <span className="inline-flex items-center gap-1.5"><Icon name="thumbsDown" size={15} /> {dislikes}</span>
                  <span className="inline-flex items-center gap-1.5"><Icon name="message" size={15} /> {post.comments.length} comment{post.comments.length === 1 ? '' : 's'}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
