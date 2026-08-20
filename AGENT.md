# AGENT.md — Refactor Brief for the Comic Platform

## Read First

This repo already has `AGENTS.md` at the root — it documents the current architecture (hybrid Express + Next.js 16, module pattern on the backend, env vars, gotchas). **Treat it as ground truth for how the app runs.** This file is the *refactor task brief*: what's structurally broken and the order to fix it in. Update `AGENTS.md` at the end to reflect the new conventions.

This is a refactor, not a rewrite. The backend (`server/app/modules/*`) already follows a clean, consistent module pattern (`service.ts` / `controller.ts` / `routes.ts` / `validation.ts`) — **do not restructure the backend.** The problems are almost entirely in `src/` (the Next.js frontend).

---

## Confirmed Problems (found by inspecting the codebase, not assumed)

### 1. Four competing data-fetching layers for the same data
The same resource is fetched a different way depending on which file you're in:
- `src/redux/api/*.ts` — RTK Query slices (`seriesApi.ts`, `userApi.ts`, etc.)
- `src/services/*.ts` — plain `fetch` wrappers, used from Server Components (`{ success, data, message }` shape)
- `src/actions/*.ts` — `"use server"` actions, used for mutations with `revalidateTag`
- `src/lib/api.ts` — a raw axios instance, called directly inside client components

Example: `getAllSeries` exists independently in `redux/api/seriesApi.ts` AND `services/series.service.ts`, with different response typing. This is the single biggest source of "which pattern do I follow" confusion and needs a decision, not more layers.

### 2. God pages — no server/client split
17 of the ~25 files under `src/app/dashboard/**/page.tsx` are `"use client"` at the page level, meaning data fetching, state, and UI all live in one file. Worst offenders:
- `src/app/dashboard/withdrawals/page.tsx` — 1,239 lines
- `src/app/dashboard/analytics/page.tsx` — 661 lines
- `src/app/dashboard/admin-series/page.tsx` — 572 lines
- `src/app/dashboard/channel/page.tsx` — 533 lines

Compare to `src/app/page.tsx`, which does it right: a thin Server Component that just renders `<HomeClient />`. That's the pattern to replicate everywhere.

### 3. Dead duplicate route
`src/app/dashboard/series/[id]/analytics/page.tsx` and `src/app/dashboard/series/analytics/[id]/page.tsx` are byte-identical (575 lines each). One is dead. Confirm which URL is actually linked to/used, delete the other.

### 4. Oversized non-page components
Several components mix data logic, form state, and large JSX trees in one file:
- `src/components/dashboard/ChapterForm.tsx` — 972 lines
- `src/components/dashboard/SettingsClient.tsx` — 867 lines
- `src/components/transactions/TransactionsClient.tsx` — 691 lines
- `src/components/rewards/RewardsClient.tsx` — 646 lines
- `src/components/dashboard/AdsTable.tsx` — 618 lines

### 5. `components/dashboard/` and `components/home/` are flat dumping grounds
Tables, forms, cards, and page-specific composite components all sit at the same level with no distinction between reusable UI and feature-specific components (unlike `components/ui/`, which is already correctly scoped to primitives).

---

## Fix Order (do NOT reorder — later steps depend on earlier ones being stable)

### Phase 0 — Safe cleanup (no behavior risk)
1. Resolve the duplicate analytics route: grep the codebase for links to both `/dashboard/series/[id]/analytics` and `/dashboard/series/analytics/[id]`, keep the one actually linked, delete the other and any now-dead imports.
2. Run `pnpm lint` and fix/flag unused exports in `src/redux/api/*` and `src/services/*` to see which endpoints are actually dead vs. duplicated-but-live.

### Phase 1 — Pick ONE data layer per context (the highest-leverage fix)
Don't invent a fifth pattern. Standardize on what `AGENTS.md` already says is intended:
- **Server Components** (default in `src/app`) → fetch via `src/services/*.ts`.
- **Mutations from client UI** → `src/actions/*.ts` server actions with `revalidateTag`.
- **Client-side reactive/interactive state that isn't just "data from the server"** (e.g. reader progress in `redux/slices/readerSlice.ts`) → keep Redux, but only for actual client state, not as a data-fetching layer.
- **Deprecate**: RTK Query endpoints in `redux/api/*` that duplicate a `services/*` fetch, and raw `src/lib/api.ts` axios calls made directly inside components.

For each resource (series, chapters, users, payments, etc.):
- Diff the RTK Query version against the `services/` version.
- Pick the one with correct typing and error handling (fix it if neither is complete).
- Migrate all call sites to the chosen version.
- Delete the losing implementation and its now-unused RTK Query injected endpoints.

Do this resource-by-resource, verifying `pnpm build` after each, not all at once.

### Phase 2 — Split god pages into Server + Client
For each `"use client"` page in `src/app/dashboard/**`:
1. Rename the current file's component to `[Feature]Client.tsx` and move it into `src/components/dashboard/[feature]/`.
2. Replace `page.tsx` with a thin async Server Component that fetches initial data via the Phase-1 service layer and passes it as props to the Client component (mirror `src/app/page.tsx` → `HomeClient`).
3. Inside the extracted Client component, pull out sub-pieces that are independently reusable (a filter bar, a status badge, a modal) into their own files.
4. Add `loading.tsx` next to any route segment that fetches data server-side.

Target: no `page.tsx` over ~100 lines; no single component over ~300 lines without a clear reason.

### Phase 3 — Reorganize `components/dashboard/` and `components/home/`
Split the flat folders by role, mirroring what already works in `components/ui/`:
```
components/dashboard/
├── tables/        # DataTable, SeriesTable, UsersTable, ChaptersTable, AdsTable, ...
├── forms/         # ChapterForm, SeriesForm
├── charts/        # OverviewCharts, StatCard
└── [feature]/     # ProfileClient, SettingsClient, SeriesDetailsView, etc. (from Phase 2)
```
Only move files — no logic changes in this phase.

### Phase 4 — Route groups & layout consistency
`src/app/dashboard/layout.tsx` is already a good example (auth check + Sidebar + shared chrome). Apply the same idea to the public-facing routes: introduce a `(marketing)` route group for `about`, `contact`, `privacy`, `terms`, `dmca` so they share a layout instead of each page re-implementing its own wrapper (check each file first — don't assume duplication, verify it).

### Phase 5 — Final pass
- Re-run `pnpm build` and `pnpm lint` clean.
- Update `AGENTS.md`'s "Frontend Patterns" section to describe the now-single data-fetching convention.
- List every file moved/renamed/deleted (old path → new path) and every duplicate implementation removed.

---

## Hard Constraints

- Don't touch `server/` structure or `server/generated/prisma/` — those are correct and/or generated.
- Don't change the Express+Next hybrid setup, the Stripe `express.raw()` ordering, or `server/index.ts` — see the "Gotchas" section of `AGENTS.md`.
- Don't add new dependencies to solve the data-layer duplication — the fix is deletion and consolidation, not a new library.
- After every phase, confirm `pnpm build` succeeds before starting the next phase.
- If a component's purpose is unclear before deleting it (e.g. an RTK Query endpoint with no visible call sites), grep the whole repo — including `server/` — before removing it; some may be used dynamically.

## Deliverable Per Phase
A short before/after note: what moved, what was deleted (and why it was confirmed dead), and any call site that needed manual review.
