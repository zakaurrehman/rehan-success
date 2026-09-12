import { prisma } from '@/lib/prisma'
import { StarDisplay } from '@/components/StarRating'
import CountdownTimer from '@/components/CountdownTimer'
import FAQSection from '@/components/FAQSection'
import Navbar from '@/components/marketing/Navbar'
import Footer, { StoreBadges } from '@/components/marketing/Footer'
import Reveal from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/states'
import { Icon, type IconName } from '@/components/brand/icons'
import { LogoMark } from '@/components/brand/Logo'
import { BRAND } from '@/lib/site'

export const dynamic = 'force-dynamic'

async function getData() {
  try {
    const [reviews, stats] = await Promise.all([
      prisma.review.findMany({ where: { status: 'APPROVED' }, orderBy: { createdAt: 'desc' }, take: 3 }),
      prisma.signalStat.findMany({ orderBy: { updatedAt: 'desc' }, take: 3 }),
    ])
    return { reviews, stats }
  } catch {
    return { reviews: [], stats: [] }
  }
}

function SectionHeading({ eyebrow, title, subtitle, center = true }: { eyebrow: string; title: React.ReactNode; subtitle?: string; center?: boolean }) {
  return (
    <div className={center ? 'text-center max-w-2xl mx-auto' : 'max-w-xl'}>
      <Reveal><span className="eyebrow">{eyebrow}</span></Reveal>
      <Reveal delay={60}><h2 className="mt-4 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold">{title}</h2></Reveal>
      {subtitle && <Reveal delay={120}><p className="mt-3 text-muted text-base leading-relaxed">{subtitle}</p></Reveal>}
    </div>
  )
}

type Plan = {
  name: string; price: string; period: string; desc: string; features: string[]
  originalPrice?: string; badge?: string; highlight?: boolean; disabled?: boolean
}

const PLANS: Plan[] = [
  { name: 'Basic Training', originalPrice: '$37.70', price: '30', period: 'one-time', desc: 'Build solid Forex fundamentals', features: ['Forex fundamentals course', 'Chart reading basics', 'Risk management guide', 'Community access', 'Email support'] },
  { name: 'Advanced Trading Strategies', originalPrice: '$128.70', price: '103', period: 'one-time', desc: 'Strategies used by professional traders', features: ['Everything in Basic', 'Advanced technical analysis', 'Entry & exit frameworks', 'Weekly live sessions', 'Priority support', 'Strategy playbooks'], badge: 'Most popular', highlight: true },
  { name: 'Mastery Bundle', originalPrice: '$154.70', price: '124', period: 'one-time', desc: 'The complete path to consistency', features: ['Everything in Advanced', 'Full course library', 'Exclusive masterclasses', 'Trade review sessions', 'Lifetime updates', '1-on-1 onboarding call'], badge: 'Best value' },
  { name: 'Premium Signals', originalPrice: '$63.70', price: '51', period: 'month', desc: 'Daily signals with full trade levels', features: ['Daily Forex signals', 'XAU/USD & major pairs', 'Entry, TP & SL on every trade', 'Instant app alerts', 'Win-rate tracking'] },
  { name: 'Personal Mentorship', originalPrice: '$258.70', price: '207', period: 'one-time', desc: 'Direct 1-on-1 coaching', features: ['Everything in Mastery', '4 private mentorship calls', 'Personalised trade plan', 'Psychology coaching', 'Portfolio review'] },
  { name: 'Trading Bot', price: 'TBA', period: 'coming soon', desc: 'Automated signal execution', features: ['Automated trade execution', 'Custom strategy settings', 'Built-in risk management', 'Performance analytics'], disabled: true },
]

const PAIRS = ['XAU/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'GBP/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NAS100', 'US30']

const FEATURES: { icon: IconName; title: string; desc: string; span?: string }[] = [
  { icon: 'bolt', title: 'Live signal desk', desc: 'BUY/SELL calls with Entry, TP1–TP3 and Stop Loss, pushed to web and mobile the moment they’re issued.', span: 'md:col-span-2' },
  { icon: 'graduation', title: 'ICT & SMC classroom', desc: 'Structured video courses from fundamentals to Smart Money Concepts, with progress tracking and certificates.' },
  { icon: 'fileText', title: 'Market research', desc: 'Regular analysis on Forex, Gold, indices, crypto and oil.' },
  { icon: 'calendar', title: 'Economic calendar', desc: 'High-impact events like NFP, CPI and FOMC with forecasts and actuals.' },
  { icon: 'calculator', title: 'Risk calculator', desc: 'Position-size every trade in seconds from your balance, risk % and stop distance.' },
  { icon: 'users', title: 'Trader community', desc: 'Share analysis, discuss setups and learn alongside disciplined traders.' },
  { icon: 'gift', title: '50% affiliate commission', desc: 'Refer traders with your personal link and earn half of every sale — withdraw on request.', span: 'md:col-span-2' },
]

export default async function LandingPage() {
  const { reviews, stats } = await getData()
  const latest = stats[0]

  return (
    <div className="bg-canvas text-text min-h-dvh overflow-x-hidden">
      <Navbar />

      {/* ══ HERO ══ */}
      <section className="relative isolate">
        <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-70 mask-fade-b" />
          <div className="absolute inset-0 bg-hero" />
        </div>
        <div className="container-x pt-12 pb-16 md:pt-20 md:pb-24 grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] items-center">
          <div className="text-center lg:text-left">
            <Reveal>
              <span className="eyebrow"><span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: 'var(--rs-primary)' }} /> Forex signals · ICT education · Research</span>
            </Reveal>
            <Reveal delay={70}>
              <h1 className="mt-6 text-[clamp(2.4rem,5.4vw,3.9rem)] font-extrabold leading-[1.04] tracking-[-0.035em]">
                Disciplined trading.<br /><span className="text-gradient">Lasting success.</span>
              </h1>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-muted text-[clamp(1rem,2vw,1.15rem)] leading-relaxed">
                {BRAND.name} gives you a professional signal desk, a structured Smart Money classroom and daily market research — everything you need to trade with a plan instead of a guess.
              </p>
            </Reveal>
            <Reveal delay={210}>
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Button href="/order" size="lg" iconRight="arrowRight">Start trading smarter</Button>
                <Button href="#pricing" size="lg" variant="secondary">View plans</Button>
              </div>
            </Reveal>
            <Reveal delay={270}>
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-muted">
                {[
                  { icon: 'shieldCheck' as IconName, label: 'Entry, TP & SL on every signal' },
                  { icon: 'bell' as IconName, label: 'Instant mobile alerts' },
                  { icon: 'lock' as IconName, label: 'Secure accounts' },
                ].map((t) => (
                  <span key={t.label} className="inline-flex items-center gap-1.5"><Icon name={t.icon} size={16} className="text-primary" /> {t.label}</span>
                ))}
              </div>
            </Reveal>
            <Reveal delay={320}><div className="mt-7 flex justify-center lg:justify-start"><StoreBadges /></div></Reveal>
          </div>

          {/* Product preview */}
          <Reveal delay={150} className="relative">
            <div className={`relative mx-auto max-w-[460px] ${latest ? 'pb-20' : ''}`}>
              <div aria-hidden className="absolute -inset-6 rounded-[2rem] blur-2xl opacity-60" style={{ background: 'var(--rs-grad-hero)' }} />
              <div className="relative card !p-0 overflow-hidden" style={{ boxShadow: 'var(--rs-shadow-lg)' }}>
                <div className="flex items-center justify-between px-5 py-3.5 border-b hairline" style={{ background: 'var(--rs-surface-2)' }}>
                  <div className="flex items-center gap-2"><LogoMark size={22} /><span className="text-ink text-sm font-semibold">Signal desk</span></div>
                  <span className="pill pill-neutral">Sample signal</span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-dim text-xs font-semibold tracking-wider">XAU/USD · H4</div>
                      <div className="flex items-center gap-2 mt-1"><span className="text-ink text-2xl font-extrabold font-display">Gold</span><span className="pill pill-solid-success">BUY</span></div>
                    </div>
                    <span className="pill pill-success"><span className="w-1.5 h-1.5 rounded-full live-dot bg-current" /> Active</span>
                  </div>
                  <svg viewBox="0 0 400 110" className="w-full h-24 mt-4" aria-hidden="true">
                    <defs>
                      <linearGradient id="lpArea" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0" stopColor="var(--rs-primary)" stopOpacity="0.25" />
                        <stop offset="1" stopColor="var(--rs-primary)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <line x1="0" x2="400" y1="26" y2="26" stroke="var(--rs-success)" strokeDasharray="4 5" strokeOpacity="0.7" />
                    <line x1="0" x2="400" y1="92" y2="92" stroke="var(--rs-danger)" strokeDasharray="4 5" strokeOpacity="0.7" />
                    <path d="M0 80 L40 74 L80 82 L120 66 L160 70 L200 58 L240 62 L280 46 L320 50 L360 36 L400 30 L400 110 L0 110Z" fill="url(#lpArea)" />
                    <path d="M0 80 L40 74 L80 82 L120 66 L160 70 L200 58 L240 62 L280 46 L320 50 L360 36 L400 30" fill="none" stroke="var(--rs-primary)" strokeWidth="2.5" strokeLinejoin="round" />
                  </svg>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="level"><div className="level-label">Entry</div><div className="level-value">2,345.50</div></div>
                    <div className="level" style={{ borderColor: 'var(--rs-success-line)' }}><div className="level-label" style={{ color: 'var(--rs-success-text)' }}>TP1</div><div className="level-value">2,358.00</div></div>
                    <div className="level" style={{ borderColor: 'var(--rs-danger-line)' }}><div className="level-label" style={{ color: 'var(--rs-danger-text)' }}>SL</div><div className="level-value">2,335.00</div></div>
                  </div>
                  <p className="text-muted text-xs leading-relaxed mt-3 pt-3 border-t hairline">Rationale: H4 break of structure, order-block retest at 2,345, liquidity resting above 2,370. Risk 1% of balance.</p>
                </div>
              </div>

              {latest ? (
                <div className="absolute bottom-0 -left-2 sm:-left-10 card !p-4 w-[190px] animate-float" style={{ boxShadow: 'var(--rs-shadow-md)' }}>
                  <div className="text-dim text-[11px] font-semibold">{latest.month} win rate</div>
                  <div className="num text-ink text-2xl font-semibold mt-1">{latest.winRate}%</div>
                  <div className="progress mt-2"><span style={{ width: `${Math.min(100, latest.winRate)}%` }} /></div>
                </div>
              ) : null}
            </div>
          </Reveal>
        </div>

        <div className="ticker relative border-y hairline py-3.5 mask-fade-edges" style={{ background: 'var(--rs-surface)' }}>
          <div className="ticker-track gap-8 pr-8">
            {[...PAIRS, ...PAIRS].map((p, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-sm font-semibold text-muted shrink-0 num">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: i % 3 === 0 ? 'var(--rs-gold)' : 'var(--rs-primary)' }} />{p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PERFORMANCE ══ */}
      <section id="signals" className="container-x py-20 md:py-28 scroll-mt-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-center">
          <SectionHeading center={false} eyebrow="Track record" title="Performance you can check" subtitle="Every signal is logged when it opens and when it closes. Monthly results are published from that history — wins and losses." />
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.length > 0 ? stats.map((s, i) => (
              <Reveal key={s.id} delay={i * 80}>
                <div className="card h-full">
                  <div className="text-muted text-sm font-medium">{s.month}</div>
                  <div className="num text-ink text-3xl font-semibold mt-3">{s.winRate}%</div>
                  <div className="text-dim text-xs">win rate</div>
                  <div className="progress my-4"><span style={{ width: `${Math.min(100, s.winRate)}%` }} /></div>
                  <dl className="grid grid-cols-2 gap-2 text-xs">
                    <div><dt className="text-dim">Pips gained</dt><dd className="num font-semibold mt-0.5" style={{ color: 'var(--rs-success-text)' }}>+{s.pipsGained}</dd></div>
                    <div><dt className="text-dim">Signals</dt><dd className="num text-ink font-semibold mt-0.5">{s.totalSignals}</dd></div>
                  </dl>
                </div>
              </Reveal>
            )) : (
              <div className="sm:col-span-3 card-flat text-center py-12" style={{ borderStyle: 'dashed' }}>
                <p className="text-ink font-semibold">Monthly results are published here</p>
                <p className="text-muted text-sm mt-1">Performance appears once the first month of signals closes.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══ FEATURES (bento) ══ */}
      <section id="features" className="border-y hairline scroll-mt-20" style={{ background: 'var(--rs-canvas-2)' }}>
        <div className="container-x py-20 md:py-28">
          <SectionHeading eyebrow="The platform" title="One workspace for your whole trading routine" subtitle="Plan the session, take the setup, review the result and keep learning — without switching between five apps." />
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 70} className={f.span}>
                <div className="card card-hover h-full p-6">
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--rs-primary-tint)', color: 'var(--rs-primary)' }}>
                    <Icon name={f.icon} size={21} />
                  </span>
                  <h3 className="text-ink font-bold text-lg mt-5">{f.title}</h3>
                  <p className="text-muted text-sm leading-relaxed mt-2">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="container-x py-20 md:py-28">
        <SectionHeading eyebrow="How it works" title="From sign-up to your first planned trade" />
        <ol className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            { icon: 'target' as IconName, title: 'Choose your plan', desc: 'Pick a course bundle or the signals subscription that fits your level. Access unlocks once payment is confirmed.' },
            { icon: 'bookOpen' as IconName, title: 'Learn and follow signals', desc: 'Work through the classroom, join live sessions and receive BUY/SELL signals with complete trade levels.' },
            { icon: 'trendingUp' as IconName, title: 'Execute with a process', desc: 'Size positions with the risk calculator, follow your plan and review results against the published history.' },
          ].map((s, i) => (
            <Reveal key={s.title} delay={i * 90}>
              <li className="card h-full p-6 relative overflow-hidden">
                <span className="num absolute top-4 right-5 text-5xl font-semibold" style={{ color: 'var(--rs-primary-tint-2)' }}>0{i + 1}</span>
                <span className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--rs-primary)', color: 'var(--rs-primary-fg)' }}><Icon name={s.icon} size={21} /></span>
                <h3 className="text-ink font-bold text-lg mt-5">{s.title}</h3>
                <p className="text-muted text-sm leading-relaxed mt-2">{s.desc}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ══ MENTOR ══ */}
      <section id="about" className="scroll-mt-20">
        <div className="container-x pb-20 md:pb-28">
          <div className="rounded-[1.75rem] overflow-hidden relative text-white" style={{ background: 'linear-gradient(145deg, #0b3f3b 0%, #0b1020 75%)' }}>
            <div aria-hidden className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.25), transparent 65%)' }} />
            <div className="relative grid gap-10 md:grid-cols-[auto_minmax(0,1fr)] items-center p-8 md:p-14">
              <Reveal className="flex justify-center">
                <div className="w-44 h-44 md:w-56 md:h-56 rounded-[2rem] flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <LogoMark size={120} />
                </div>
              </Reveal>
              <div>
                <Reveal><span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.12em] uppercase" style={{ background: 'rgba(45,212,191,0.14)', color: '#5eead4' }}>Meet your mentor</span></Reveal>
                <Reveal delay={70}><h2 className="text-white mt-4 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold leading-tight">Trading is a skill.<br />We teach it like one.</h2></Reveal>
                <Reveal delay={140}>
                  <p className="mt-5 text-white/75 leading-relaxed max-w-2xl">
                    {BRAND.mentorName} and the {BRAND.name} team teach a methodology rooted in <strong className="text-white">ICT (Inner Circle Trader)</strong> concepts and <strong className="text-white">Smart Money</strong> trading — reading institutional order flow, liquidity and market structure to find high-probability setups. The same process powers every signal we publish.
                  </p>
                </Reveal>
                <Reveal delay={200}>
                  <div className="mt-7 flex flex-wrap gap-2">
                    {['ICT concepts', 'Smart Money', 'XAU/USD specialist', 'Risk-first process'].map((t) => (
                      <span key={t} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}>{t}</span>
                    ))}
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section id="pricing" className="border-t hairline scroll-mt-20" style={{ background: 'var(--rs-canvas-2)' }}>
        <div className="container-x py-20 md:py-28">
          <SectionHeading eyebrow="Pricing" title="Simple plans. Serious results." subtitle="Pay once for courses, or subscribe monthly for signals." />
          <Reveal delay={150}><div className="flex justify-center mt-6"><CountdownTimer /></div></Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PLANS.map((p, i) => (
              <Reveal key={p.name} delay={(i % 3) * 70}>
                <div
                  className="relative h-full rounded-[1.25rem] p-7 flex flex-col"
                  style={p.highlight
                    ? { background: 'var(--rs-surface)', border: '1.5px solid var(--rs-primary)', boxShadow: 'var(--rs-shadow-md)' }
                    : { background: 'var(--rs-surface)', border: '1px solid var(--rs-line)', opacity: p.disabled ? 0.7 : 1 }}
                >
                  {p.badge ? (
                    <span className={`absolute -top-3 left-7 pill ${p.highlight ? 'pill-solid-primary' : 'pill-gold'} !px-3 !py-1`}>{p.badge}</span>
                  ) : null}
                  <h3 className="text-ink font-bold text-lg">{p.name}</h3>
                  <p className="text-muted text-sm mt-1">{p.desc}</p>
                  <div className="flex items-baseline gap-1.5 mt-5">
                    {p.price === 'TBA'
                      ? <span className="text-ink font-extrabold text-4xl font-display">TBA</span>
                      : <><span className="num text-ink font-semibold text-4xl">${p.price}</span><span className="text-dim text-sm">/ {p.period}</span></>}
                  </div>
                  {p.originalPrice ? (
                    <div className="flex items-center gap-2 mt-1.5"><span className="text-dim text-sm line-through num">{p.originalPrice}</span><span className="pill pill-gold">20% off</span></div>
                  ) : <div className="h-[26px]" />}
                  <ul className="space-y-2.5 mt-6 mb-7 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-text text-sm"><Icon name="check" size={16} className="text-primary shrink-0 mt-0.5" strokeWidth={2.2} /> {f}</li>
                    ))}
                  </ul>
                  {!p.disabled
                    ? <Button href="/order" variant={p.highlight ? 'primary' : 'secondary'} block>Get started</Button>
                    : <span className="btn btn-secondary btn-block" aria-disabled="true">Coming soon</span>}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section id="reviews" className="container-x py-20 md:py-28 scroll-mt-20">
        <SectionHeading eyebrow="Testimonials" title="What our traders say" />
        {reviews.length > 0 ? (
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {reviews.map((r, i) => (
              <Reveal key={r.id} delay={i * 80}>
                <figure className="card h-full p-6 flex flex-col">
                  <StarDisplay rating={r.rating} />
                  <blockquote className="text-text text-[15px] leading-relaxed my-5 flex-1">“{r.content}”</blockquote>
                  <figcaption className="flex items-center gap-3 pt-4 border-t hairline">
                    <Avatar name={r.clientName} size={36} />
                    <span className="text-ink font-semibold text-sm">{r.clientName}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted mt-8">Reviews from members will appear here.</p>
        )}
        <div className="text-center mt-10"><Button href="/reviews" variant="outline" iconRight="arrowRight">Read all reviews</Button></div>
      </section>

      {/* ══ FAQ ══ */}
      <section id="faq" className="border-t hairline scroll-mt-20" style={{ background: 'var(--rs-canvas-2)' }}>
        <div className="container-tight py-20 md:py-28">
          <SectionHeading eyebrow="FAQ" title="Questions, answered" />
          <div className="mt-12"><FAQSection /></div>
        </div>
      </section>

      {/* ══ AFFILIATE CTA ══ */}
      <section className="container-x py-20 md:py-24">
        <div className="card !p-0 overflow-hidden">
          <div className="grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] items-center">
            <div className="p-8 md:p-12">
              <span className="pill pill-gold">Affiliate program</span>
              <h2 className="mt-4 text-[clamp(1.8rem,4vw,2.4rem)] font-extrabold">Earn while you learn</h2>
              <p className="mt-3 text-muted leading-relaxed max-w-lg">Share your personal referral link and earn <strong>50% commission</strong> on every plan purchased through it. Track sales and request withdrawals from your dashboard.</p>
              <div className="mt-7 flex flex-wrap gap-3"><Button href="/register" variant="gold" iconRight="arrowRight">Become an affiliate</Button><Button href="/login" variant="ghost">Affiliate sign in</Button></div>
            </div>
            <div className="hidden md:flex h-full items-center justify-center p-10 border-l hairline" style={{ background: 'var(--rs-surface-2)' }}>
              <div className="text-center">
                <div className="num text-6xl font-semibold" style={{ color: 'var(--rs-gold-text)' }}>50%</div>
                <div className="text-muted text-sm mt-2">commission per sale</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
