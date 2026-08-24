# Walkthrough: Reader Quality Score Creator Revenue Distribution & Revert Engine

## 1. Feature Architecture Overview
We have built a first-party, database-driven Creator Revenue Distribution engine that distributes ad network pools proportionally based on verified **Reader Quality Scores** without reliance on external tools like GA4 or Google Ad Manager.

---

## 2. Completed Milestones

### Stage 1: Prisma Schema & Enums
- Added enums `QualityTier` (`BOUNCED`, `QUALIFIED`, `ENGAGED`, `COMPLETED`), `DistributionStatus` (`COMPLETED`, `REVERTED`), and updated `TransactionType` (`REVENUE_SHARE`, `REVENUE_SHARE_REVERSAL`, `WITHDRAWAL_REFUND`).
- Created models:
  - `ChapterReadEvent`: Unique on `[sessionId, chapterId]` with telemetry metrics, quality score, bot detection flags, `interactionCount`, and `clientIp` indexing.
  - `RevenueDistributionRun`: Tracks period, gross entered pool, quality scores, status, and admin execution metadata.
  - `RevenueDistributionPayout`: Itemized per-creator payout records including `revertedPoints` and `shortfallPoints`.

### Stage 2: Telemetry Ingestion & Bot Detection
- Ingests reading session updates at `POST /api/v1/ad-revenue/track` with 15s heartbeats and exit beacons in `ChapterReader.tsx`.
- Protected by `readTrackLimiter` (30 req/min per IP).
- Stateful multi-session IP farming check (`checkHighFrequencyIp`): Flags sessions from IPs generating $\ge 8$ distinct sessions or $\ge 25$ total events in a 10-minute sliding window (`HIGH_FREQUENCY_IP`).
- Single-session bot heuristics: `INSTANT_BOUNCE`, `IMPOSSIBLE_SPEED`, `NO_INTERACTION`.

### Stage 3: Preview & Atomic Money-Crediting Distribution
- Preview endpoint `GET /api/v1/ad-revenue/distribution/preview`: Aggregation-time deduplication taking the single best-qualifying read per user per chapter per period.
- Overlap detection preventing overlapping date ranges with existing `COMPLETED` runs.
- Execution endpoint `POST /api/v1/ad-revenue/distribution/execute`: Atomic Prisma `$transaction` crediting `User.points`, `CreatorProfile.totalEarnings`, and creating `PointTransaction` + `AuditLog` records.

### Stage 4: Revert Engine & Clawback Accounting
- Revert endpoint `POST /api/v1/ad-revenue/distribution/:id/revert`:
  1. Strict allow-list guard (`run.status === DistributionStatus.COMPLETED`).
  2. Auto-cancels all `PENDING` withdrawal requests for affected creators with clear explanatory notes and refunds them to live balance.
  3. Claws back points from live available balance (clamped at 0, never negative).
  4. Records unresolved shortfalls for any amount previously withdrawn via approved cashouts.
  5. Records `PointTransaction` (`WITHDRAWAL_REFUND`, `REVENUE_SHARE_REVERSAL`) and comprehensive `AuditLog` records.
  6. Allows reverted periods to be cleanly re-run.

---

## 3. Admin Dashboard UI (`/dashboard/revenue-distribution`)
- **Server Component**: `src/app/dashboard/revenue-distribution/page.tsx`
- **Client Component**: `src/components/dashboard/revenue/RevenueDistributionClient.tsx`
- **Navigation & Route Protection**: Linked in `Sidebar.tsx` and guarded in `src/proxy.ts`.
- **Features**:
  - Period presets (Previous Month, This Month, Last 30 Days).
  - Live preview cards with diagnostic bot/guest counters.
  - Itemized creator payout table with ranking and share percentages.
  - 2-step confirmation modals for execution and two-step "type REVERT to confirm" modal for clawback reversal.
  - Detailed historical run inspector modal displaying original payouts, clawback amounts, and shortfalls.

---

## 4. Verification Results
- `pnpm build`: **Passed (0 errors)**
- `pnpm lint`: **Passed (0 errors)**
- Automated E2E verification test (`scratch/test_revenue_distribution_e2e.ts`):
  - Read event scoring: **Verified**
  - Preview calculations & deduplication: **Verified**
  - Distribution execution & point crediting: **Verified**
  - Pending withdrawal auto-cancellation & refund: **Verified**
  - Live balance clawback & shortfall accounting: **Verified**
  - Double-revert blocking guard: **Verified**
  - Period re-run clearance after revert: **Verified**
