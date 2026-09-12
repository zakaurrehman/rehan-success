import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/mobile-auth'

/**
 * Permanently delete the authenticated user's account and all associated data.
 * Required by Apple App Store Guideline 5.1.1(v) for any app that supports
 * account creation.
 *
 * Order of deletions matters because most relations don't have onDelete: Cascade.
 * MobileRefreshToken + DeviceToken DO cascade, so they go automatically with
 * `prisma.user.delete`.
 */
export async function DELETE(req: NextRequest) {
  const session = await getAuthSession(req)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  // Admins cannot delete themselves via the app — they must be removed by
  // another admin to keep at least one admin present.
  if (session.user.role === 'ADMIN') {
    return NextResponse.json(
      { error: 'Admin accounts cannot be deleted from the app. Contact support.' },
      { status: 403 }
    )
  }

  try {
    await prisma.$transaction([
      // User-owned content first
      prisma.postReaction.deleteMany({ where: { userId } }),
      prisma.communityComment.deleteMany({ where: { authorId: userId } }),
      // Deleting CommunityPost cascades any comments + reactions on that post
      prisma.communityPost.deleteMany({ where: { authorId: userId } }),
      prisma.researchPost.deleteMany({ where: { authorId: userId } }),
      prisma.courseProgress.deleteMany({ where: { userId } }),
      prisma.certificate.deleteMany({ where: { userId } }),
      prisma.notification.deleteMany({ where: { userId } }),

      // Affiliate-related — Commission must go before Sale (FK dependency)
      prisma.commission.deleteMany({ where: { affiliateId: userId } }),
      prisma.withdrawalRequest.deleteMany({ where: { affiliateId: userId } }),
      prisma.sale.deleteMany({ where: { affiliateId: userId } }),

      // Finally the user — MobileRefreshToken + DeviceToken cascade
      prisma.user.delete({ where: { id: userId } }),
    ])

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[delete-account] Failed:', e)
    return NextResponse.json(
      { error: 'Could not delete account. Please contact support.' },
      { status: 500 }
    )
  }
}
