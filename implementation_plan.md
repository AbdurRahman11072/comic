# React Native Mobile App Implementation Plan

Plan to develop a cross-platform (iOS & Android) mobile application for the **Comic Platform** using **React Native (Expo SDK 53+)**, consuming the existing Express 5 / PostgreSQL backend API.

---

## User Review Required

> [!IMPORTANT]
> **Project Workspace Structure**: We need to decide where the React Native app should live:
> 1. **Monorepo Subdirectory** (e.g. `mobile/` or `apps/mobile/` inside this current repository) — *Recommended for shared TypeScript types and single repo management*.
> 2. **Separate Repository/Directory** (outside the current folder).

> [!WARNING]
> **Authentication Token Handling**: The web app currently uses HTTP-only cookies (`better-auth`). For the mobile app, we will use `@better-auth/expo` / Bearer token authentication or cookie forwarding via `expo-secure-store` to ensure smooth authentication persistence across app restarts.

---

## Open Questions

> [!NOTE]
> Please review the following design decisions before execution:
> 1. **In-App Purchases (IAP) vs Stripe**: Apple App Store guidelines require In-App Purchases (StoreKit) for digital goods like comic unlocking/coins on iOS, while Stripe can be used on Android/Web. Should we implement Stripe first (or both Stripe + Expo In-App Purchases)?
> 2. **Mobile Ad Provider**: Will you use **Google AdMob** (`react-native-google-mobile-ads`) for Rewarded/Banner ads or the existing custom banner ads from the backend?
> 3. **UI Library**: Do you prefer **React Native Reusables / Tailwind (NativeWind v4)** matching the web aesthetic, or a pre-styled framework like **React Native Paper / Gluestack UI**?

---

## Proposed Architecture & Tech Stack

```
┌──────────────────────────────────────────────────────────┐
│             React Native App (Expo SDK 53+)              │
├──────────────────────────────────────────────────────────┤
│ UI & Styling  │ NativeWind v4 (Tailwind CSS) + Reanimated│
│ Navigation    │ React Navigation v7 (Tabs + Native Stack)│
│ State & Query │ TanStack React Query v5 + Zustand        │
│ HTTP Client   │ Axios + Auth Interceptor                 │
│ Auth / Secure │ @better-auth/expo + expo-secure-store    │
│ Media & Cache │ expo-image (BlurHash & disk cache)       │
│ Reader Engine │ Custom Vertical Continuous & Paged Modes │
│ Monetization  │ Google AdMob + Stripe / IAP              │
└────────────────────────────┬─────────────────────────────┘
                             │ HTTPS / JSON
                             ▼
┌──────────────────────────────────────────────────────────┐
│             Existing Express 5 Backend API               │
│               • Auth: /api/auth/*                        │
│               • REST: /api/v1/*                          │
│               • Database: PostgreSQL (Prisma ORM)        │
└──────────────────────────────────────────────────────────┘
```

---

## File Structure Plan (`mobile/` directory)

```
mobile/
├── app.json                       # Expo configuration & plugins
├── package.json                   # Mobile dependencies
├── tsconfig.json                  # TypeScript config
├── tailwind.config.js             # NativeWind styling tokens
├── App.tsx                        # Root application entry
│
└── src/
    ├── api/                       # Axios client & API endpoints
    │   ├── client.ts              # Base axios with token interceptor
    │   ├── auth.api.ts            # Sign-in, sign-up, session fetch
    │   ├── series.api.ts          # Series listing, details, filter
    │   ├── chapter.api.ts         # Chapter pages, reader data
    │   ├── points.api.ts          # Balance, rewards, unlocking
    │   └── community.api.ts       # Comments, reviews, chat
    │
    ├── navigation/                # Navigation configurations
    │   ├── AppNavigator.tsx       # Root Stack (Auth + Main + Modals)
    │   ├── BottomTabNavigator.tsx # Home, Browse, Library, Rewards, Profile
    │   ├── AuthNavigator.tsx      # Login, Register, Forgot Password
    │   └── types.ts               # Typed navigation parameters
    │
    ├── screens/                   # App Screen Views
    │   ├── auth/                  # LoginScreen, RegisterScreen
    │   ├── home/                  # HomeScreen (Hero, Pinned, Latest, Recommended)
    │   ├── browse/                # BrowseScreen (Genres, Search, Filters)
    │   ├── series/                # SeriesDetailScreen, ChapterReaderScreen
    │   ├── library/               # LibraryScreen (Bookmarks & History tabs)
    │   ├── rewards/               # RewardsScreen (Watch Ads for coins)
    │   ├── shop/                  # ShopScreen (Stripe point packages)
    │   ├── profile/               # ProfileScreen, TransactionsScreen
    │   ├── community/             # ChatRoomScreen, SearchModal
    │   └── dashboard/             # Creator/Moderator/Admin Mobile Management
    │
    ├── components/                # Reusable UI Primitives & Widgets
    │   ├── reader/                # ScrollReader, PageReader, ReaderSettings
    │   ├── cards/                 # GridCard, PosterCard, ChapterRow
    │   ├── layout/                # ScreenWrapper, SectionHeader, GlassCard
    │   ├── interactive/           # BookmarkButton, RatingStars, PointsBadge
    │   └── feedback/              # SkeletonLoader, Toast, ConfirmModal
    │
    ├── store/                     # Global State Management
    │   ├── useAuthStore.ts        # User state, role, session
    │   ├── useReaderStore.ts      # Reading mode, zoom, background theme
    │   └── usePointsStore.ts      # Real-time points balance
    │
    ├── hooks/                     # Custom React Query Hooks
    │   ├── useSeries.ts
    │   ├── useChapters.ts
    │   └── useHistory.ts
    │
    └── theme/                     # Dark theme colors, fonts, layout constants
        ├── colors.ts
        └── index.ts
```

---

## Phased Implementation Plan

### Phase 1: Project Setup & Core Foundation
- Initialize Expo project inside `mobile/` with TypeScript template.
- Configure **NativeWind v4** with the dark-mode color scheme matching the web app.
- Setup **Axios client** with base URL pointing to the backend API (`http://10.0.2.2:5000` for Android emulator or local network IP / Render URL).
- Implement `@better-auth/expo` and session persistence with `expo-secure-store`.
- Build **Auth Flow**: Login, Registration, and Session Restore.

### Phase 2: Navigation & Discovery Experience
- Set up **React Navigation v7** with Bottom Tabs:
  - 🏠 **Home**: Hero banner, Pinned series, Top Rated, Latest updates.
  - 🔍 **Browse**: Search with debounce, genre filters, status/type tabs.
  - 📚 **Library**: Bookmarks & Reading History with resume button.
  - 🎁 **Rewards**: Ad rewards & daily streak.
  - 👤 **Profile**: Points balance, referral code, settings, transactions.
- Build reusable UI cards: `PosterCard`, `GridCard`, and `SectionHeader`.

### Phase 3: High-Performance Comic Reader
- Implement dual reading modes:
  - **Vertical Webtoon Scroll**: Optimized `FlashList` / `FlatList` with `expo-image` (zero flicker, memory recycling).
  - **Horizontal Page Flip**: Swipe gesture page reader with double-tap zoom.
- Reading settings modal: brightness, background color (black/gray/white), screen awake lock.
- Automatic reading progress tracker syncing to `/api/v1/user/history`.
- Chapter locked state checking & bulk/single unlock modal with points.

### Phase 4: Monetization, Points & Rewards
- Integrate **Points Economy**:
  - Point balance sync and real-time deduct on chapter unlock.
  - Rewarded Ads integration (Google AdMob / Custom Ads fallback).
  - Stripe mobile checkout integration (`@stripe/stripe-react-native`).
- Transaction history screen with filtering (`EARN_AD`, `BUY_CHAPTER`, `BUY_POINTS`).

### Phase 5: Community & Interactive Features
- Chapter Comments section with pagination and instant post.
- Series Star Rating & Reviews.
- Global Community Live Chat room.
- Profile editing (avatar upload via Cloudinary, display name).

### Phase 6: Creator & Admin Mobile Tools
- Mobile-optimized dashboard views:
  - Creator: Series listing, chapter manager, view counts, earnings.
  - Moderator/Admin: User ban/mute, report triage, creator application approvals.

### Phase 7: Polish, Performance & Build Setup
- Offline caching for recently read chapters.
- Deep linking support (`comicbd://series/:slug`).
- Configure EAS Build (`eas.json`) for Android APK/AAB and iOS IPA.

---

## Verification Plan

### Automated & Static Verification
- Run TypeScript type checks: `pnpm --filter mobile tsc --noEmit`
- Run linting: `pnpm --filter mobile lint`

### Device & Simulator Verification
- **Android Emulator / Device**: Run `npx expo run:android` and verify auth, home slider, series reader, and points deduction.
- **iOS Simulator / Device**: Run `npx expo run:ios` and verify smooth 60fps scrolling, gesture handling, and safe-area insets.
- **Backend Sync**: Validate that bookmarks, reading history, and unlocked chapters synchronize seamlessly between the Web frontend and Mobile app.
