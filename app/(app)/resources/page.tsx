import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canAccessResource } from '@/lib/gating'
import { PageHeader, EmptyState } from '@/components/ui/states'
import { Icon } from '@/components/brand/icons'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = { title: 'Resources' }

const TIER_CLS: Record<string, string> = { FREE: 'pill-success', BASIC: 'pill-primary', PREMIUM: 'pill-gold' }

export default async function ResourcesPage() {
  const session = await getServerSession(authOptions)
  const plan = session?.user.plan
  const resources = await prisma.resource.findMany({ orderBy: [{ tier: 'asc' }, { createdAt: 'desc' }] })
  const categories = Array.from(new Set(resources.map((r) => r.category)))

  return (
    <div className="fade-in">
      <PageHeader title="Resource library" subtitle="Guides, cheat sheets and research downloads." />

      {resources.length === 0 ? (
        <EmptyState icon="layers" title="Resources coming soon" description="Downloadable guides will be published here." />
      ) : (
        <div className="flex flex-col gap-8">
          {categories.map((cat) => (
            <section key={cat}>
              <h2 className="section-title mb-3">{cat}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {resources.filter((r) => r.category === cat).map((r) => {
                  const locked = !canAccessResource(r.tier, plan)
                  return (
                    <article key={r.id} className="card-flat p-4 flex gap-4" style={{ boxShadow: 'var(--rs-shadow-xs)' }}>
                      <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: locked ? 'var(--rs-surface-2)' : 'var(--rs-primary-tint)', color: locked ? 'var(--rs-dim)' : 'var(--rs-primary)' }}>
                        <Icon name={locked ? 'lock' : 'fileText'} size={20} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-ink font-semibold text-[15px] leading-snug">{r.title}</h3>
                          <span className={`pill ${TIER_CLS[r.tier] || 'pill-neutral'} shrink-0`}>{r.tier}</span>
                        </div>
                        <p className="text-muted text-sm mt-1 line-clamp-2">{r.description}</p>
                        <div className="flex items-center justify-between gap-2 mt-3">
                          <span className="text-dim text-xs inline-flex items-center gap-1"><Icon name="download" size={13} /> {r.downloads} downloads</span>
                          {locked ? (
                            <Button href="/order" size="sm" variant="secondary" icon="sparkles">Upgrade</Button>
                          ) : (
                            <Button href={r.fileUrl} external size="sm" icon="download">Download</Button>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
