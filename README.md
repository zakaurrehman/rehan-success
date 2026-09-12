# Rehan Success

Professional Forex education and live-signals platform — web app, member workspace, admin console and a native iOS/Android app.

| Part | Stack | Location |
| --- | --- | --- |
| Web app + API | Next.js 15 (App Router), TypeScript, Tailwind CSS v4, NextAuth, Prisma 6 + PostgreSQL | repo root |
| Mobile app | Expo SDK 54, expo-router, React Query, expo-secure-store | `mobile/` |
| Brand assets | Generated from one vector definition | `scripts/generate-brand-assets.mjs` |

---

## 1. Quick start (web)

```bash
npm install
cp .env.example .env          # fill in DATABASE_URL, NEXTAUTH_SECRET, URLs
npx prisma db push            # create tables in YOUR database
npm run db:seed               # admin user (admin / SEED_ADMIN_PASSWORD); add SEED_SAMPLE_DATA=true for demo data locally
npm run dev                   # http://localhost:3000
```

> **Use a dedicated database.** Rehan Success must never point at another product's production database. Create a new PostgreSQL database (Neon, Supabase, RDS, local…) and put its URL in `.env`.

Change the seeded admin password immediately after first login.

### Environment variables

See `.env.example`. Key values:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Signs web sessions **and** mobile access tokens — long random value |
| `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` | Public URL of this deployment (referral links use it) |
| `NEXT_PUBLIC_SITE_URL` | Canonical marketing domain for metadata/sitemap |
| `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_SUPPORT_WHATSAPP` | Support contacts shown in the UI |
| `NEXT_PUBLIC_SOCIAL_*`, `NEXT_PUBLIC_IOS_APP_URL`, `NEXT_PUBLIC_ANDROID_APP_URL` | Optional — hidden when empty |

Never commit `.env` (already git-ignored).

### Scripts

| Command | |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` | TypeScript |
| `npm run db:push` / `db:studio` / `db:seed` | Prisma |
| `node scripts/generate-brand-assets.mjs` | Regenerate favicon, PWA icons, OG image and mobile icons/splash |

---

## 2. Deploying the web app on Vercel

1. **Import** the GitHub repo in Vercel (framework: Next.js, root directory: repo root). The first deploy can run before the database exists.
2. **Create the database:** Project → Storage → create a Postgres database (Neon) and connect it to the project. Make sure the project has a `DATABASE_URL` environment variable — if the integration only adds differently named variables (e.g. `POSTGRES_PRISMA_URL`), add `DATABASE_URL` yourself with the pooled connection string.
3. **Add environment variables** (Project → Settings → Environment Variables):
   - `NEXTAUTH_SECRET` — long random value (`openssl rand -base64 32`)
   - `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL` — your production URL, e.g. `https://rehan-success.vercel.app`
   - `NEXT_PUBLIC_SUPPORT_EMAIL` and any optional social/app-store links
4. **Create the tables and admin user** once, from your computer, using the database's connection string (prefer the *unpooled* one for schema changes):

   ```powershell
   # PowerShell
   $env:DATABASE_URL="postgresql://...your Vercel/Neon URL..."
   $env:SEED_ADMIN_PASSWORD="a-strong-password"
   npx prisma db push
   npm run db:seed
   ```

   ```bash
   # bash
   DATABASE_URL="postgresql://..." SEED_ADMIN_PASSWORD="a-strong-password" sh -c 'npx prisma db push && npm run db:seed'
   ```
5. **Redeploy** (needed after adding or changing any `NEXT_PUBLIC_*` variable) and sign in at `/login` as `admin`.

When deploying the mobile app, set `EXPO_PUBLIC_API_URL` in `mobile/eas.json` to the same production URL.

---

## 3. Mobile app

```bash
cd mobile
npm install
cp .env.example .env          # EXPO_PUBLIC_API_URL → your backend
npm run start                 # Expo dev tools
npm run typecheck
```

`EXPO_PUBLIC_API_URL`: iOS simulator `http://localhost:3000`, Android emulator `http://10.0.2.2:3000`, physical device `http://<LAN-IP>:3000` or your HTTPS domain.

### Before the first store build
1. `npx eas-cli login` then `npx eas-cli init` — creates a **new** EAS project for Rehan Success; put the id in `EAS_PROJECT_ID`.
2. Confirm bundle ids (`com.rehansuccess.app` by default, overridable via `IOS_BUNDLE_ID` / `ANDROID_PACKAGE`).
3. Update the production API URL in `mobile/eas.json`.
4. `npx eas-cli build --profile production --platform android|ios`

App Store compliance behaviour is preserved: on iOS premium content and prices are hidden and upgrades link to the website.

---

## 4. Structure

```
app/
  (public)/        landing, login, register, order, reviews, privacy
  (app)/           member workspace: dashboard, signals, markets, research, calendar,
                   classroom, live, community, resources, calculator, brokers,
                   affiliate, notifications, profile
  admin/           admin console (signals, content, users, payments, payouts…)
  api/             REST API shared by web (cookie) and mobile (Bearer token)
components/
  brand/           Logo + icon set
  ui/              Button, feedback (toast/confirm/prompt/modal), states, theme toggle
  app/             member shell (sidebar, top bar, bottom nav)
  admin/           admin shell + toolkit
  marketing/       navbar, footer, auth shell
lib/               auth, mobile-auth, prisma, push, notify, gating, site config, utils
prisma/            schema + seed
mobile/
  app/(auth|app|admin)   expo-router screens
  src/theme.tsx          design tokens + ThemeProvider (light/dark/system)
  src/components/        UI kit, SignalCard, Select, PromptModal, admin helpers
```

---

## 5. Design system — "Verdant Ink"

One token set shared by web (`app/globals.css`) and mobile (`mobile/src/theme.tsx`).

| Role | Light | Dark |
| --- | --- | --- |
| Primary (deep teal) | `#0F766E` | `#2DD4BF` |
| Accent (champagne gold — premium/achievement) | `#B8901F` | `#E3C063` |
| Canvas / surface | `#F5F7FA` / `#FFFFFF` | `#0B1020` / `#121A2B` |
| Ink / muted text | `#0B1121` / `#5E6B7E` | `#EEF2F7` / `#A3ADBE` |
| Success / danger / warning | `#16A34A` / `#DC2626` / `#F59E0B` (AA text variants for small text) | `#22C55E` / `#EF4444` / `#F59E0B` |

Typography: **Manrope** (display), **Plus Jakarta Sans** (UI/body), **JetBrains Mono** (prices, balances, levels).
Themes: web follows the OS preference with a persisted toggle; mobile offers System / Light / Dark in Account → Appearance.

---

## 6. Notable changes compared with the original platform

Functionality, API contracts, database schema and business rules (plan mapping, 50% commissions, withdrawal settlement, signal lifecycle, auth/refresh-token flow) are unchanged, except for these fixes:

- **Lesson completion** — `POST /api/classroom` rejected every non-admin, so member progress and certificates were never saved. Members can now mark lessons complete; creating courses/videos is still admin-only.
- **Premium content leaks closed** — premium research content, premium course videos and gated resource download links were returned to anyone via direct URLs/API. They are now only served to eligible plans (admins see everything). Web research detail pages enforce the same lock.
- **Resource tier rule unified** — web and mobile used different rules; both now use: FREE → all, BASIC → any paid plan, PREMIUM → Advanced and above.
- **Community reactions on web** — like/dislike used a server action that never reached the API; replaced with a working client toggle.
- **Admin brokers** — hidden brokers disappeared from the admin list and could not be re-activated; admins now load `?all=1`.
- **Signal stats ordering** — "current month" was chosen by string-sorting month names; it now uses the most recently updated record.
- **Mobile admin "TP/SL hit"** stored a price distance as "pips"; it now asks for the pip result like the web console.
- **Web TradingView widgets** only loaded on hard refresh; they now load on client navigation and follow the theme.
- Web notifications can be marked read; web profile gains account deletion (existing endpoint); logged-in users land on the new **Overview** dashboard.
- Security headers added (`X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`); `X-Powered-By` removed; unrestricted remote image optimisation removed.

### Content to confirm before launch
- Marketing copy (plans, FAQ, mentor section) was carried over and rebranded — confirm claims, prices and the mentor bio. Fake fallback testimonials were removed; only approved reviews are shown.
- The "launch pricing" countdown on the landing page restarts per visitor (inherited behaviour) — consider removing it or tying it to a real deadline.
- Add a real mentor photo/logo if desired (edit `scripts/generate-brand-assets.mjs` and re-run).

### Known limitations (inherited)
- Password reset is handled by support (no email service is configured).
- `POST /api/order` trusts the submitted amount; admins verify it when confirming payments.
- The login rate limiter is in-memory (use Redis/Upstash when running multiple instances).
