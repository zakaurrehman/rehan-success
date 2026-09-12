import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDateTime } from '@/lib/utils'
import { Avatar } from '@/components/ui/states'
import { Icon } from '@/components/brand/icons'
import CommentSection from './CommentSection'
import ReactionButtons from './ReactionButtons'

export default async function CommunityPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const userId = session?.user.id

  const post = await prisma.communityPost.findUnique({
    where: { id },
    include: {
      author: { select: { fullName: true, studentId: true } },
      comments: { include: { author: { select: { fullName: true, studentId: true } } }, orderBy: { createdAt: 'asc' } },
      reactions: true,
    },
  })
  if (!post) notFound()

  const userReaction = post.reactions.find((r) => r.userId === userId)?.type ?? null
  const likes = post.reactions.filter((r) => r.type === 'LIKE').length
  const dislikes = post.reactions.filter((r) => r.type === 'DISLIKE').length

  return (
    <div className="fade-in max-w-3xl">
      <Link href="/community" className="link-muted inline-flex items-center gap-1 text-[13px] font-medium mb-4">
        <Icon name="chevronLeft" size={16} /> Community
      </Link>

      <article className="card p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <Avatar name={post.author.fullName} size={42} />
          <div>
            <div className="text-ink font-semibold">{post.author.fullName}</div>
            <div className="text-dim text-xs">{post.author.studentId} · {formatDateTime(post.createdAt)}</div>
          </div>
        </div>
        <h1 className="text-[clamp(1.35rem,3vw,1.75rem)] font-extrabold mt-4 leading-snug">{post.title}</h1>
        {post.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.imageUrl} alt="" className="w-full rounded-xl mt-4 border hairline" loading="lazy" decoding="async" />
        ) : null}
        <p className="text-text text-[15px] leading-[1.8] whitespace-pre-wrap mt-4">{post.content}</p>
        <div className="mt-5 pt-4 border-t hairline">
          <ReactionButtons postId={post.id} likes={likes} dislikes={dislikes} userReaction={userReaction} />
        </div>
      </article>

      <CommentSection
        postId={post.id}
        comments={post.comments.map((c) => ({ id: c.id, content: c.content, authorName: c.author.fullName, studentId: c.author.studentId, createdAt: c.createdAt.toISOString() }))}
      />
    </div>
  )
}
