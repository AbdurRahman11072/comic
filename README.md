# Comic BD — Comic Reading Platform

A full-stack comic/manga/manhwa reading platform with creator monetization, points economy, Stripe payments, and ad revenue sharing. Built with Next.js 16 (App Router) + Express hybrid architecture.

## Features

- **Reading Experience** — Vertical scroll reader, bookmarks, reading history, chapter fast-pass
- **Creator Studio** — Series publishing, chapter management, analytics, 100% revenue share
- **Points Economy** — Earn points by watching ads, buy via Stripe, unlock premium chapters
- **Community** — Chapter comments, series reviews, global chat, creator posts
- **Admin Dashboard** — User/creator management, role control, moderation, reports, backups
- **Monetization** — Google AdSense integration (banner/rewarded), custom direct ads, promo codes, referral bonuses
- **SEO & Legal** — Dynamic sitemap + robots.txt, privacy policy, ToS, DMCA, contact page, cookie consent (GDPR/CCPA)
- **Security** — Rate limiting, CAPTCHA, IP signup restriction, helmet, CSP headers, audit logs

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19, Redux Toolkit, Tailwind CSS 4, shadcn/ui |
| Backend | Express 5, TypeScript, Better-auth |
| Database | PostgreSQL + Prisma ORM |
| Payments | Stripe |
| Storage | Cloudinary |
| Cache/Queue | Redis (ioredis) |
| Logging | pino |
| Deployment | Docker (multi-stage), production Express server |

## Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL
- Redis
- Cloudinary account
- Stripe account (test/live keys)

## Installation

```bash
# 1. Clone and install dependencies
git clone <repo-url> comic
cd comic
pnpm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your database, auth secret, Cloudinary, Stripe, and Redis values

# 3. Set up database
pnpm mg        # prisma migrate dev (creates tables)
pnpm ge        # prisma generate (regenerates client to server/generated/prisma)

# 4. Run migrations manually (optional, if mg has issues)
npx prisma migrate deploy
```

## Environment Variables

All variables documented in [`.env.example`](.env.example):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Auth signing secret |
| `NEXT_PUBLIC_APP_URL` | Public app URL (e.g. `https://genztoon.com`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `REDIS_URL` | Redis connection URL |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Initial admin credentials for seeding |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Google AdSense publisher ID (e.g. `ca-pub-XXXX`) |

## Development

```bash
pnpm dev    # Express (5000) + Next.js hybrid dev server
```

- Frontend & API served together on `http://localhost:5000`
- API base path: `/api/v1/*`
- Stripe webhook endpoint: `/api/v1/payments/webhook`

### Stripe Webhook (local)

```bash
stripe listen --forward-to localhost:5000/api/v1/payments/webhook
```

## Seeding

Requires the backend to be running (falls back to direct DB insert if unreachable):

```bash
pnpm seed
```

Creates:
- Admin user (`admin@gmail.com` / `Admin123@`)
- 4 sample series with 5 chapters each
- Default AdSense placements

> **Important:** Replace the sample series cover/background images with your own original or licensed artwork before going live. Hotlinked third-party images violate Google AdSense content policy.

## Production

```bash
pnpm build     # prisma generate + next build + tsc server
pnpm start     # production Express server (tsx server/index.ts)
```

### Docker

```bash
# Build
docker build -t genztoon .

# Run (set env vars before running)
docker run -p 5000:5000 \
  -e DATABASE_URL=postgresql://... \
  -e BETTER_AUTH_SECRET=... \
  -e STRIPE_SECRET_KEY=... \
  -e STRIPE_WEBHOOK_SECRET=... \
  -e CLOUDINARY_CLOUD_NAME=... \
  -e CLOUDINARY_API_KEY=... \
  -e CLOUDINARY_API_SECRET=... \
  -e REDIS_URL=redis://... \
  -e NEXT_PUBLIC_APP_URL=https://genztoon.com \
  genztoon

# Apply migrations before first start
docker run --rm genztoon npx prisma migrate deploy
```

The Dockerfile runs as a non-root user (`appuser`), listens on port `5000`, and runs Prisma generate at build time.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (Express + Next.js on port 5000) |
| `pnpm build` | Prisma generate + Next.js build + tsc server |
| `pnpm build:frontend` | Prisma generate + Next.js build only |
| `pnpm build:server` | Prisma generate + tsc server only |
| `pnpm start` | Production start (tsx server/index.ts) |
| `pnpm lint` | ESLint (Next.js core-web-vitals + TS) |
| `pnpm mg` | Prisma migrate dev |
| `pnpm ge` | Prisma generate |
| `pnpm seed` | Seed admin + sample series (requires running backend) |

## Project Structure

```
├── prisma/
│   ├── schema.prisma          # Database schema (enums, models, relations)
│   └── migrations/            # SQL migrations
├── server/                    # Express backend
│   ├── index.ts               # Server entry (Next.js + Express hybrid)
│   ├── lib/                   # Prisma client, Better-auth config
│   ├── app/
│   │   ├── config/            # Env config
│   │   ├── middleware/        # Auth, rate limiting, CAPTCHA, validation
│   │   ├── modules/           # Feature modules (service + controller + routes)
│   │   └── utils/             # Logger, Redis, Cloudinary, keep-alive
│   └── generated/prisma/      # Generated Prisma client (custom output)
├── src/                       # Next.js frontend
│   ├── app/                   # App Router pages (server components)
│   │   ├── dashboard/         # Admin/creator dashboards
│   │   ├── series/            # Series & chapter pages
│   │   ├── privacy/ terms/ dmca/ about/ contact/   # Legal & contact pages
│   ├── components/            # Client components (UI, ads, series, etc.)
│   ├── services/              # API fetch wrappers
│   ├── actions/               # Server actions (mutations + revalidate)
│   ├── redux/                 # RTK Query API slices & store
│   ├── lib/                   # API client, metadata, utils
│   └── config/                # Site defaults
├── public/                    # Static assets (ads.txt, app-ads.txt, icons)
├── Dockerfile                 # Multi-stage production build
└── ads.txt                    # AdSense verification file
```

## SEO & AdSense

- **Dynamic sitemap**: `/sitemap.xml` (all series, chapters, creators)
- **Dynamic robots.txt**: `/robots.txt` (crawler directives + sitemap reference)
- **ads.txt / app-ads.txt**: present in root and `public/` for AdSense/AdMob verification
- **Legal pages**: Privacy Policy (GDPR/CCPA), Terms of Service, DMCA, About, Contact
- **Cookie consent**: GDPR-compliant banner with consent mode (essential/all)
- **Meta management**: `src/lib/metadata.ts` builds OpenGraph/Twitter/AdSense meta tags

## License

Private project. All rights reserved.