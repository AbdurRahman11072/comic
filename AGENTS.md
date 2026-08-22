# AGENTS.md - Comic Platform

## Quick Commands
```bash
pnpm dev          # Start dev server (Express + Next.js on port 5000)
pnpm build        # Prisma generate + Next.js build + tsc server
pnpm start        # Production start (tsx server/index.ts)
pnpm lint         # ESLint (Next.js core-web-vitals + TS)
pnpm mg           # Prisma migrate dev
pnpm ge           # Prisma generate
pnpm seed         # Seed admin + sample series (requires running backend)
```

## Architecture
- **Hybrid Express + Next.js 16**: Express handles `/api/v1/*`, Next.js App Router handles everything else
- **Monorepo**: Single package.json, shared Prisma client at `server/generated/prisma/`
- **Backend modules**: `server/app/modules/{feature}/{service,controller,routes}.ts`
- **Frontend**: `src/app` (Server Components), `src/components` (Client Components), `src/services` (typed fetch services), `src/actions` (Server Actions)

## Key Conventions
- **Auth**: Better-auth with email/password + admin plugin. Sessions via cookies (`credentials: 'include'`)
- **Data Fetching & Component Patterns**:
  - **Reads / SSR**: Server Components (`src/app/**/page.tsx` default) fetch initial data on the server via typed fetch services (`src/services/*.ts`) with cache tags, construct metadata via `constructMetadata`, and pass typed props down. Some services (`creator`, `ad`, `promo`, `referral`) also surface an HTTP `statusCode` for callers that need to distinguish error types (e.g. 404 vs 500).
  - **Mutations**: Server Actions (`src/actions/*.ts`) with `cookies()` forwarding and targeted `revalidateTag(...)` cache invalidation.
  - **Interactive UI**: Client Components (`src/components/**` with `'use client'`) handle user interactivity, event handlers, local animations, and modal state.
  - **Client State**: `PointsProvider` and `SiteConfigProvider` contexts for instant cross-component client state synchronization.
  - **Redux Store**: `readerSlice` in `src/redux/store.ts` exclusively for client-side reader preferences (theme, layout, font-size). Zero RTK Query.
- **Dashboard Architecture (Phase 2 Convention)**:
  - Every data-driven route under `src/app/dashboard/*` follows this pattern: a thin async Server Component `page.tsx` that performs request-time SSR data fetching, delegating interactive UI, forms, tables, filters, and modal managers to dedicated Client Components under `src/components/dashboard/[feature]/[Feature]Client.tsx`.
  - A few routes (`cms`, `roles`, `comments`, `cashout`) are simple redirects/re-exports to other dashboard pages and have no Server Component data-fetching of their own.
  - Legacy exception: some dashboard components (`UsersTable`, `SeriesTable`, `ChaptersTable`, `TransactionsTable`, and similar pre-Phase-2 components) live flat under `src/components/dashboard/` rather than in a `[feature]/` subfolder — the nested `[feature]/[Feature]Client.tsx` pattern applies to pages split during Phase 2 specifically.
- **Public Layout Route Group `(public)`**:
  - All public-facing consumer routes (`/`, `/about`, `/bookmarks`, `/channel/[id]`, `/contact`, `/dmca`, `/history`, `/latest`, `/privacy`, `/profile`, `/rewards`, `/series`, `/series/[slug]`, `/shop`, `/terms`, `/transactions`) reside under `src/app/(public)/`.
  - Framed by a unified `src/app/(public)/layout.tsx` rendering `<Navbar />`, `<main className="flex-1 relative">{children}</main>`, and `<Footer />`.
  - **Exceptions**:
    - Chapter Reader (`src/app/series/[slug]/[chapterNumber]/page.tsx`) remains outside `(public)` for distraction-free reading without global Navbar collision.
    - Developer Sandboxes (`src/app/stripe-sandbox/page.tsx`) remain outside `(public)`.
    - Root 404 (`src/app/not-found.tsx`) resides at root to catch all unrouted application URLs, with explicit Navbar and Footer framing.
- **Prisma output**: Custom path `../server/generated/prisma` (not node_modules)
- **Role-based auth middleware**: `authMiddleware(['creator','admin'])` in route files
- **IP signup restriction**: 1 account per IP (enforced in `server/index.ts:51-72`)

## Environment Variables (required in `.env`)
```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:5000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
REDIS_URL=redis://...
ADMIN_NAME=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
```

## Database
- **PostgreSQL** via Prisma (schema: `prisma/schema.prisma` - 477 lines)
- **Enums**: Role, PaymentStatus, TransactionType, SeriesType, SeriesStatus, ApplicationStatus, ReportStatus
- **Seed**: `pnpm seed` creates admin (admin@gmail.com / Admin123@) + 4 sample series with 5 chapters each

## Dev Workflow
1. `pnpm mg` after schema changes
2. `pnpm ge` after schema changes (generates to `server/generated/prisma`)
3. `pnpm dev` runs both servers (Express on 5000, Next.js internal)
4. Stripe webhook: `stripe listen --forward-to localhost:5000/api/v1/payments/webhook`

## Gotchas
- **Stripe webhook** must use `express.raw()` BEFORE `express.json()` (see `server/index.ts:42-46`)
- **Next.js handler** must be LAST middleware (after all API routes)
- **Prisma client** imported from `server/lib/prisma.ts` (wraps generated client)
- **No tests** in repo - verify manually via dev server
- **Seed requires running backend** (tries API first, falls back to direct DB insert)

## Module Pattern (Backend)
```
server/app/modules/{feature}/
├── {feature}.service.ts   # Business logic, Prisma operations
├── {feature}.controller.ts # HTTP handlers, uses asyncHandler + sendResponse
└── {feature}.routes.ts    # Route defs + authMiddleware
```