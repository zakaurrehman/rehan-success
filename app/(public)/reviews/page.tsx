import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { StarDisplay } from '@/components/StarRating'
import { Icon } from '@/components/brand/icons'
import Navbar from '@/components/marketing/Navbar'
import Footer from '@/components/marketing/Footer'
import { Avatar } from '@/components/ui/states'
import ReviewForm from './ReviewForm'

export const metadata: Metadata = { title: 'Trader reviews' }
export const dynamic = 'force-dynamic'

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({ where: { status: 'APPROVED' }, orderBy: { createdAt: 'desc' } })
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  return (
    <div className="min-h-dvh bg-canvas">
      <Navbar />
      <section className="container-x pt-12 pb-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="eyebrow">Testimonials</span>
          <h1 className="text-[clamp(2rem,4.5vw,2.8rem)] font-extrabold mt-4">Trader reviews</h1>
          {reviews.length ? (
            <div className="mt-4 inline-flex items-center gap-3 card-sub !py-2">
              <span className="num text-ink font-semibold text-lg">{avg.toFixed(1)}</span>
              <StarDisplay rating={Math.round(avg)} />
              <span className="text-muted text-sm">{reviews.length} review{reviews.length === 1 ? '' : 's'}</span>
            </div>
          ) : (
            <p className="text-muted mt-3">Honest feedback from our community.</p>
          )}
        </div>

        {reviews.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 mb-16 [&>*]:mb-4">
            {reviews.map((r) => (
              <figure key={r.id} className="card break-inside-avoid p-6">
                <div className="flex items-center justify-between">
                  <StarDisplay rating={r.rating} />
                  <Icon name="quote" size={22} className="text-primary opacity-25" />
                </div>
                <blockquote className="text-text text-[14px] leading-relaxed my-4">“{r.content}”</blockquote>
                <figcaption className="flex items-center gap-2.5">
                  <Avatar name={r.clientName} size={32} />
                  <span className="text-ink font-semibold text-sm">{r.clientName}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="card-flat text-center py-12 mb-12 max-w-lg mx-auto" style={{ borderStyle: 'dashed' }}>
            <p className="text-ink font-semibold">No reviews published yet</p>
            <p className="text-muted text-sm mt-1">Be the first to share your experience below.</p>
          </div>
        )}

        <ReviewForm />
      </section>
      <Footer />
    </div>
  )
}
