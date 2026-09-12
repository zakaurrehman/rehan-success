import type { Metadata } from 'next'
import Navbar from '@/components/marketing/Navbar'
import Footer from '@/components/marketing/Footer'
import { BRAND, SITE_URL, SUPPORT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: `Privacy policy for the ${BRAND.name} platform and mobile app — how we collect, use and protect your data.`,
}

const SECTIONS = [
  { id: 'collect', title: 'Information we collect' },
  { id: 'use', title: 'How we use your information' },
  { id: 'share', title: 'How we share information' },
  { id: 'security', title: 'Data security' },
  { id: 'push', title: 'Push notifications' },
  { id: 'rights', title: 'Your rights' },
  { id: 'deletion', title: 'Account deletion' },
  { id: 'children', title: 'Children’s privacy' },
  { id: 'risk', title: 'Trading risk disclaimer' },
  { id: 'changes', title: 'Changes to this policy' },
  { id: 'contact', title: 'Contact' },
]

export default function PrivacyPolicy() {
  const lastUpdated = '1 September 2026'
  const host = SITE_URL.replace(/^https?:\/\//, '')
  const Email = () => <a href={`mailto:${SUPPORT_EMAIL}`} className="link">{SUPPORT_EMAIL}</a>

  return (
    <div className="min-h-dvh bg-canvas">
      <Navbar />
      <div className="container-x py-10 md:py-14 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24" aria-label="On this page">
            <div className="section-title mb-3">On this page</div>
            <ul className="space-y-1.5 text-sm">
              {SECTIONS.map((s, i) => (
                <li key={s.id}><a href={`#${s.id}`} className="link-muted">{i + 1}. {s.title}</a></li>
              ))}
            </ul>
          </nav>
        </aside>

        <article className="card p-6 md:p-10 max-w-3xl prose-rs">
          <span className="eyebrow">Legal</span>
          <h1 className="text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold mt-4">Privacy policy</h1>
          <p className="text-dim text-sm mt-2">Last updated: {lastUpdated}</p>

          <P><strong>{BRAND.name}</strong> (“we”, “us”, “our”) operates the website <a href={SITE_URL} className="link">{host}</a> and the {BRAND.name} mobile application (the “Service”). This policy explains what personal information we collect, how we use it, and the choices you have. By using the Service you agree to this policy.</P>

          <H2 id="collect" n={1}>Information we collect</H2>
          <P>We collect only what we need to provide the Service:</P>
          <UL items={[
            <><strong>Account data</strong> — full name, email, phone, country, username, password (stored as a bcrypt hash), preferred payout method and an optional social handle.</>,
            <><strong>Authentication tokens</strong> — short-lived (15 minute) access tokens and 30-day refresh tokens for the mobile app. Refresh tokens are stored only as SHA-256 hashes.</>,
            <><strong>Device tokens</strong> — if you allow notifications, we store your device’s Expo push token to deliver alerts.</>,
            <><strong>Payment requests</strong> — name, email, phone, country, selected plan, payment method and the transaction reference you submit. We never collect or store card numbers; payments happen outside the platform.</>,
            <><strong>Activity data</strong> — course progress, certificates, community posts, comments, reactions, reviews and affiliate records (sales, commissions, withdrawals).</>,
            <><strong>Technical data</strong> — IP address and basic request headers, used only for rate-limiting and abuse prevention. We do not run advertising trackers.</>,
          ]} />

          <H2 id="use" n={2}>How we use your information</H2>
          <UL items={[
            'Authenticate you and keep you signed in on web and mobile.',
            'Provide courses, signals, research, community features and the affiliate dashboard.',
            'Process plan orders and affiliate commission payouts.',
            'Send notifications about new signals, live sessions and account events (only with your permission).',
            'Prevent fraud and abuse, such as credential-stuffing attempts.',
            'Respond to support requests and communicate important updates.',
          ]} />

          <H2 id="share" n={3}>How we share information</H2>
          <P><strong>We do not sell your personal information.</strong> We share data only with providers needed to run the Service:</P>
          <UL items={[
            <><strong>Database and application hosting providers</strong> — store and serve account, content and activity data.</>,
            <><strong>Expo Push Service</strong> — receives your push token and the notification title/message to deliver alerts.</>,
            <><strong>Apple App Store / Google Play</strong> — aggregate crash and download analytics collected by the stores themselves.</>,
          ]} />
          <P>We may also disclose information when required by law or a valid legal request.</P>

          <H2 id="security" n={4}>Data security</H2>
          <P>Passwords are hashed with bcrypt, refresh tokens are stored as SHA-256 hashes, and all traffic uses HTTPS/TLS. On mobile, tokens are kept in the operating system’s secure storage (Keychain on iOS, Keystore on Android). No system is perfectly secure, but we use commercially reasonable safeguards.</P>

          <H2 id="push" n={5}>Push notifications</H2>
          <P>The mobile app asks for notification permission on first use. You can revoke it at any time in your device settings — the app keeps working without notifications.</P>

          <H2 id="rights" n={6}>Your rights</H2>
          <UL items={[
            'Access the personal information we hold about you.',
            'Request correction of inaccurate information.',
            'Request deletion of your account and associated data.',
            'Withdraw consent where consent is the legal basis for processing.',
            'Opt out of push notifications via device settings.',
            'Receive a copy of your data in a machine-readable format.',
          ]} />
          <P>To exercise these rights, contact <Email /> from your registered email. We respond within 30 days.</P>

          <H2 id="deletion" n={7}>Account deletion</H2>
          <P>You can permanently delete your account from <strong>Profile → Delete my account</strong> in the mobile app, or by emailing <Email /> with the subject “Delete my account”. We delete your profile, progress, posts and affiliate records; records we must legally retain (for example, financial logs) may be kept in anonymised form.</P>

          <H2 id="children" n={8}>Children’s privacy</H2>
          <P>The Service is <strong>not intended for anyone under 18</strong>. Forex trading is a high-risk activity for adults only. If you believe a child has provided us with information, contact us and we will delete it.</P>

          <H2 id="risk" n={9}>Trading risk disclaimer</H2>
          <P>{BRAND.name} provides educational content, analysis and trade ideas for <strong>information only</strong>. We are not licensed financial advisers. Trading carries a high level of risk, past performance does not guarantee future results, and you should never trade money you cannot afford to lose.</P>

          <H2 id="changes" n={10}>Changes to this policy</H2>
          <P>We may update this policy. Material changes will be reflected in the “Last updated” date and, where appropriate, announced in-app or by email.</P>

          <H2 id="contact" n={11}>Contact</H2>
          <div className="card-sub text-sm text-muted leading-relaxed">
            <strong>{BRAND.name}</strong><br />
            Email: <Email /><br />
            Website: <a href={SITE_URL} className="link">{host}</a>
          </div>
        </article>
      </div>
      <Footer />
    </div>
  )
}

function H2({ id, n, children }: { id: string; n: number; children: React.ReactNode }) {
  return <h2 id={id} className="text-xl font-bold mt-10 mb-3 scroll-mt-24"><span className="text-primary num mr-2 text-base">{String(n).padStart(2, '0')}</span>{children}</h2>
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-muted text-[15px] leading-[1.8] mb-3">{children}</p>
}
function UL({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="text-muted text-[15px] leading-[1.75] mb-3 pl-5 list-disc space-y-1.5 marker:text-primary">
      {items.map((it, i) => <li key={i}>{it}</li>)}
    </ul>
  )
}
