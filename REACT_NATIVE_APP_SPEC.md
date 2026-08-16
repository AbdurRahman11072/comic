# 📱 React Native App — Full Build Specification

> **Source Project**: Comic BD — A full-stack Manhwa/Manga/Manhua reading platform  
> **Web Stack**: Next.js 16 (frontend) + Express 5 (API) + Prisma + PostgreSQL + better-auth + Stripe + Cloudinary  
> **Target**: React Native (Expo) mobile app consuming the existing backend API  
> **Generated**: August 16, 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Tech Stack](#2-architecture--tech-stack)
3. [Backend API Reference](#3-backend-api-reference)
4. [Authentication](#4-authentication)
5. [Data Models & TypeScript Types](#5-data-models--typescript-types)
6. [Navigation Structure](#6-navigation-structure)
7. [Screen Specifications](#7-screen-specifications)
8. [Reusable Components](#8-reusable-components)
9. [State Management](#9-state-management)
10. [Design System & Theming](#10-design-system--theming)
11. [Monetization & Ads](#11-monetization--ads)
12. [Push Notifications](#12-push-notifications)
13. [Offline Support & Caching](#13-offline-support--caching)
14. [Performance Optimizations](#14-performance-optimizations)
15. [Deployment & Build](#15-deployment--build)
16. [Project File Structure](#16-project-file-structure)
17. [Phase-wise Implementation Plan](#17-phase-wise-implementation-plan)

---

## 1. Project Overview

### What the App Does

Comic BD is a **comic/manga/manhwa reading platform** with the following core features:

| Feature | Description |
|---------|-------------|
| **Browse & Discover** | Homepage with featured/pinned/discounted/latest/completed series |
| **Series Detail** | Cover, description, genres, chapters list, ratings, reviews |
| **Chapter Reader** | Vertical scroll or page-by-page reading with theme/width settings |
| **Points Economy** | Users earn points by watching ads, buy points with money (Stripe) |
| **Chapter Unlocking** | Locked chapters require points to unlock |
| **Bookmarks** | Save series to personal library |
| **Reading History** | Auto-tracked reading progress with resume |
| **Comments & Reviews** | Comment on chapters, review series with ratings |
| **User Profile** | Name, image, referral code, points balance |
| **Creator Dashboard** | Creators can manage series, chapters, analytics, earnings |
| **Admin Dashboard** | User management, roles, reports, withdrawals, ads config |
| **Rewards Center** | Watch ad packs to earn free points |
| **Point Shop** | Purchase point packages via Stripe |
| **Chat Room** | Global live chat for community |
| **Referral System** | Invite friends and earn bonus points |

### User Roles

| Role | Capabilities |
|------|-------------|
| `user` | Browse, read, bookmark, buy chapters, earn rewards, comment |
| `creator` | Everything above + manage series/chapters, apply for features, analytics, earnings |
| `moderator` | Everything above + ban users, review applications, manage reports |
| `admin` | Full access — all moderator powers + user management, site config, roles |

---

## 2. Architecture & Tech Stack

### Recommended Stack

```
┌──────────────────────────────────────────────────┐
│                  React Native App                 │
│                  (Expo SDK 53+)                   │
├──────────────────────────────────────────────────┤
│  UI          │ React Native Paper / Gluestack UI  │
│  Navigation  │ React Navigation 7 (v7)            │
│  State       │ Zustand + React Query (TanStack)   │
│  HTTP        │ Axios                              │
│  Auth        │ better-auth/react-native            │
│  Storage     │ expo-secure-store + MMKV            │
│  Images      │ expo-image (or FastImage)           │
│  Payments    │ @stripe/stripe-react-native         │
│  Ads         │ react-native-google-mobile-ads      │
│  Animations  │ react-native-reanimated 3           │
│  Video       │ expo-av                             │
│  Gestures    │ react-native-gesture-handler        │
└──────────────────────────────────────────────────┘
          │
          │ HTTPS / REST API
          ▼
┌──────────────────────────────────────────────────┐
│          Existing Backend (Express 5)             │
│    Base URL: https://your-domain.com              │
│    Auth:     /api/auth/*  (better-auth)           │
│    API:      /api/v1/*    (REST)                  │
│    DB:       PostgreSQL (Prisma ORM)              │
│    Storage:  Cloudinary (images)                  │
│    Payment:  Stripe                               │
└──────────────────────────────────────────────────┘
```

### Key Dependencies

```json
{
  "dependencies": {
    "expo": "~53.0.0",
    "react-native": "0.79.x",
    "@react-navigation/native": "^7.x",
    "@react-navigation/bottom-tabs": "^7.x",
    "@react-navigation/native-stack": "^7.x",
    "@tanstack/react-query": "^5.x",
    "zustand": "^5.x",
    "axios": "^1.x",
    "expo-secure-store": "~14.x",
    "expo-image": "~2.x",
    "react-native-reanimated": "~3.x",
    "react-native-gesture-handler": "~2.x",
    "@stripe/stripe-react-native": "^0.42.x",
    "react-native-google-mobile-ads": "^14.x",
    "react-native-mmkv": "^3.x",
    "expo-av": "~15.x",
    "@better-auth/expo": "latest",
    "react-native-toast-message": "^2.x"
  }
}
```

---

## 3. Backend API Reference

The existing backend runs on **Express 5** with all routes under `/api/v1/*` and auth under `/api/auth/*`.

### 3.1 Authentication — `/api/auth/*` (better-auth)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/sign-up/email` | POST | No | Register with email + password (1 per IP) |
| `/api/auth/sign-in/email` | POST | No | Login with email + password |
| `/api/auth/sign-out` | POST | Yes | Logout / clear session |
| `/api/auth/get-session` | GET | Yes | Get current session/user |

### 3.2 Series — `/api/v1/series`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/series` | GET | No | Get all series (query: `limit`, `page`, `sort`, `status`, `type`, `genre`, `search`) |
| `/series/pinned` | GET | No | Get pinned/promoted series |
| `/series/featured` | GET | No | Get featured series (carousel) |
| `/series/discounted` | GET | No | Get bulk discounted series |
| `/series/:slug` | GET | Optional | Get series by slug (includes `isBookmarked`, `lastReadChapterNumber` if authed) |
| `/series/id/:id` | GET | No | Get series by ID |
| `/series` | POST | Creator+ | Create new series |
| `/series/:id` | PUT | Creator+ | Update series |
| `/series/:id` | DELETE | Creator+ | Delete series |
| `/series/:id/toggle-featured` | POST | Mod+ | Toggle featured status |

### 3.3 Chapters — `/api/v1/chapters`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/chapters` | GET | No | Get all chapters |
| `/chapters/:id` | GET | Optional | Get chapter by ID |
| `/chapters/:slug/:number` | GET | Optional | Get chapter by series slug + number (includes `isPurchased`, nav links) |
| `/chapters` | POST | Creator+ | Create chapter (with images) |
| `/chapters/:id` | PUT | Creator+ | Update chapter |
| `/chapters/:id` | DELETE | Creator+ | Delete chapter |

### 3.4 User — `/api/v1/user`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/user/profile` | GET | Yes | Get user profile (includes bookmarks, history) |
| `/user/profile` | PUT | Yes | Update user profile (name, image, referralCode) |
| `/user/bookmarks/toggle` | POST | Yes | Toggle bookmark on a series (body: `{ seriesId }`) |
| `/user/history` | POST | Yes | Update reading history (body: `{ seriesId, chapterId }`) |
| `/user` | GET | Admin | Get all users |
| `/user/:id` | PUT | Admin | Update user (role, ban, etc.) |
| `/user/:id` | DELETE | Admin | Delete user |
| `/user/admin/transactions` | GET | Admin | Get all transactions system-wide |

### 3.5 Points — `/api/v1/points`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/points/balance` | GET | Yes | Get current point balance |
| `/points/transactions` | GET | Yes | Get transaction history (type, amount, description, date) |
| `/points/earn-ad` | POST | Yes | Earn points from ad watching (body: `{ amount }`) |
| `/points/buy-chapter` | POST | Yes | Purchase a locked chapter (body: `{ chapterId }`) |

### 3.6 Payments — `/api/v1/payments`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/payments/packages` | GET | No | Get available point packages |
| `/payments/create-checkout-session` | POST | Yes | Create Stripe checkout session (body: `{ packageId }`) |
| `/payments/success` | GET | No | Payment success callback |
| `/payments/cancel` | GET | No | Payment cancel callback |
| `/payments/webhook` | POST | No | Stripe webhook (raw body) |

### 3.7 Community — `/api/v1/community`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/community/comments/:chapterId` | GET | Optional | Get comments for a chapter |
| `/community/comments` | POST | Yes | Create comment (body: `{ chapterId, content }`) |
| `/community/comments/:id` | DELETE | Yes | Delete own comment |
| `/community/reviews/:seriesId` | GET | Optional | Get reviews for a series |
| `/community/reviews` | POST | Yes | Create review (body: `{ seriesId, rating, content }`) |
| `/community/reviews/:id` | DELETE | Yes | Delete own review |
| `/community/reports` | POST | Yes | Submit report (body: `{ reason, targetType, targetId }`) |
| `/community/reports` | GET | Mod+ | Get all reports |
| `/community/reports/:id/resolve` | POST | Mod+ | Resolve report |
| `/community/chat` | GET | Optional | Get chat messages |
| `/community/chat` | POST | Yes | Send chat message (body: `{ content }`) |
| `/community/chat/:id` | DELETE | Mod+ | Delete chat message |

### 3.8 Creators — `/api/v1/creators`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/creators/profile` | GET | Creator+ | Get creator profile (earnings, channel) |
| `/creators/profile` | PUT | Creator+ | Update creator profile |
| `/creators/analytics` | GET | Creator+ | Get creator analytics (views, earnings breakdown) |
| `/creators/series-application` | POST | Yes | Apply to create a new series |
| `/creators/feature-request` | POST | Creator+ | Request series to be featured |
| `/creators/feature-requests` | GET | Creator+ | Get own feature requests |

### 3.9 Ads — `/api/v1/ads`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/ads/earn` | POST | Yes | Earn ad reward points |
| `/ads/active` | GET | No | Get active custom ad (banner/video/social) |
| `/ads` | GET | Mod+ | Get all custom ads (admin) |
| `/ads` | POST | Mod+ | Create custom ad |
| `/ads/:id` | PUT | Mod+ | Update custom ad |
| `/ads/:id` | DELETE | Mod+ | Delete custom ad |

### 3.10 Withdrawals — `/api/v1/withdrawals`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/withdrawals` | POST | Yes | Request withdrawal (body: `{ pointsRequested, bankDetails }`) |
| `/withdrawals/my-requests` | GET | Yes | Get own withdrawal requests |

### 3.11 Moderator — `/api/v1/moderator`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/moderator/users/:id/ban` | POST | Mod+ | Ban/unban user |
| `/moderator/users/:id/freeze` | POST | Mod+ | Freeze/unfreeze user transactions |
| `/moderator/series-applications` | GET | Mod+ | Get all series applications |
| `/moderator/series-applications/:id/review` | POST | Mod+ | Approve/reject application |
| `/moderator/withdrawals` | GET | Mod+ | Get all withdrawal requests |
| `/moderator/withdrawals/:id/review` | POST | Mod+ | Approve/reject withdrawal |
| `/moderator/featured-requests` | GET | Mod+ | Get featured requests |
| `/moderator/featured-requests/:id/review` | POST | Mod+ | Approve/reject featured |

### 3.12 Site Config — `/api/v1/site-config`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/site-config` | GET | No | Get site config (announce, social links, ad settings) |
| `/site-config` | PUT | Admin | Update site config |

### 3.13 Stats — `/api/v1/admin/stats`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/admin/stats` | GET | Admin | Get dashboard stats (total users, series, revenue) |

### 3.14 Upload — `/api/v1/upload`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/upload` | POST | Yes | Upload image to Cloudinary (`multipart/form-data`, field: `image`) |

### 3.15 Health — `/api/health`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/health` | GET | No | Health check endpoint |

---

## 4. Authentication

### 4.1 better-auth for React Native

The web app uses **better-auth** with cookie-based sessions. For React Native, use `@better-auth/expo`:

```typescript
// src/lib/auth.ts
import { createAuthClient } from '@better-auth/expo';
import * as SecureStore from 'expo-secure-store';

export const authClient = createAuthClient({
  baseURL: 'https://your-api-domain.com',
  storage: {
    getItem: (key) => SecureStore.getItemAsync(key),
    setItem: (key, value) => SecureStore.setItemAsync(key, value),
    removeItem: (key) => SecureStore.deleteItemAsync(key),
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

### 4.2 Auth Flow

```
┌────────────┐     ┌────────────┐     ┌───────────────┐
│   Splash   │────>│ Auth Check │────>│  Main App     │
│   Screen   │     │ (Session?) │     │  (Tab Nav)    │
└────────────┘     └──────┬─────┘     └───────────────┘
                          │ No session
                          v
                   ┌────────────┐
                   │ Auth Stack │
                   │ Login/     │
                   │ Register   │
                   └────────────┘
```

### 4.3 Axios Interceptor Setup

```typescript
// src/lib/api.ts
import axios from 'axios';
import { authClient } from './auth';

const api = axios.create({
  baseURL: 'https://your-api-domain.com/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Attach session token to every request
api.interceptors.request.use(async (config) => {
  const session = authClient.getSession();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await authClient.signOut();
      // Navigate to auth screen
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 5. Data Models & TypeScript Types

```typescript
// src/types/index.ts

// ── Enums ──
export type Role = 'user' | 'creator' | 'moderator' | 'admin';
export type SeriesType = 'MANHWA' | 'MANGA' | 'MANHUA' | 'COMIC';
export type SeriesStatus = 'ONGOING' | 'COMPLETED' | 'HIATUS' | 'DROPPED';
export type TransactionType = 'EARN_AD' | 'BUY_CHAPTER' | 'BUY_POINTS' | 'WITHDRAWAL' | 'REFERRAL_BONUS';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ── Models ──
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: Role;
  points: number;
  banned: boolean;
  referralCode?: string;
  createdAt: string;
}

export interface Genre {
  id: string;
  name: string;
}

export interface Series {
  id: string;
  title: string;
  slug: string;
  altTitles?: string;
  description?: string;
  coverUrl?: string;
  bgUrl?: string;
  type: SeriesType;
  status: SeriesStatus;
  rating: number;
  favorites: number;
  totalViews: number;
  isPinned: boolean;
  discount?: string;
  genres: Genre[];
  chapters?: Chapter[];
  isBookmarked?: boolean;          // Present when authenticated
  lastReadChapterNumber?: number;  // Present when authenticated
  _count?: {
    chapters: number;
    bookmarks: number;
  };
}

export interface Chapter {
  id: string;
  seriesId: string;
  number: number;
  title?: string;
  isLocked: boolean;
  isPurchased?: boolean;   // Present when authenticated
  coinCost: number;
  createdAt: string;
  images?: ChapterImage[];
  series?: { title: string; slug: string };
  prevChapterNumber?: number;
  nextChapterNumber?: number;
}

export interface ChapterImage {
  id: string;
  url: string;
  order: number;
}

export interface Bookmark {
  id: string;
  seriesId: string;
  series: Series;
  createdAt: string;
}

export interface History {
  id: string;
  series: Series;
  chapter: Chapter;
  updatedAt: string;
}

export interface PointTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  createdAt: string;
}

export interface PointPackage {
  id: string;
  name: string;
  points: number;
  price: number;
  popular: boolean;
  color: string;
  icon: string;
}

export interface Comment {
  id: string;
  userId: string;
  user: { id: string; name: string; image?: string };
  chapterId: string;
  content: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  user: { id: string; name: string; image?: string };
  seriesId: string;
  rating: number;
  content?: string;
  createdAt: string;
}

export interface CustomAd {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  videoUrl?: string;
  adType: 'BANNER' | 'VIDEO' | 'SOCIAL';
  socialPlatform?: string;
  socialActionUrl?: string;
  points: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  user: { id: string; name: string; image?: string; role: Role };
  content: string;
  createdAt: string;
}

export interface SiteConfig {
  announceText?: string;
  announceLink?: string;
  socialLinks?: Record<string, string>;
  referralBonusPercent: number;
  maxDailyAdPoints: number;
  pointToFiatRate: number;
  featuredRequestFee: number;
  customAdScript?: string;
}

// ── API Response Wrappers ──
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
```

---

## 6. Navigation Structure

### 6.1 Navigation Architecture

```
Root (Conditional)
|-- AuthStack (when not logged in — OPTIONAL, app works without login)
|   |-- LoginScreen
|   |-- RegisterScreen
|
|-- MainStack (always accessible)
    |-- BottomTabs
    |   |-- HomeTab -> HomeScreen
    |   |-- BrowseTab -> BrowseScreen (series list with filters)
    |   |-- RewardsTab -> RewardsScreen (auth required)
    |   |-- LibraryTab -> BookmarksScreen + HistoryScreen (auth required)
    |   |-- ProfileTab -> ProfileScreen (auth required)
    |
    |-- SeriesDetailScreen (param: slug)
    |-- ChapterReaderScreen (param: slug, chapterNumber)
    |-- ShopScreen
    |-- TransactionsScreen
    |-- ChatRoomScreen
    |-- SearchScreen (modal)
    |
    |-- Dashboard (role-gated, Drawer or nested stack)
        |-- DashboardHomeScreen
        |-- SeriesManagementScreen
        |-- ChapterManagementScreen
        |-- AddEditSeriesScreen
        |-- AddEditChapterScreen
        |-- AnalyticsScreen
        |-- UsersScreen (admin)
        |-- RolesScreen (admin)
        |-- ReportsScreen (mod+)
        |-- ApplicationsScreen (mod+)
        |-- WithdrawalsScreen (mod+)
        |-- AdsManagementScreen (mod+)
        |-- SettingsScreen (admin)
        |-- FeaturedRequestsScreen (mod+)
        |-- EarningsScreen (creator+)
```

### 6.2 Bottom Tab Configuration

```typescript
const tabs = [
  { name: 'Home',     icon: 'home',       component: HomeScreen },
  { name: 'Browse',   icon: 'compass',    component: BrowseScreen },
  { name: 'Rewards',  icon: 'gift',       component: RewardsScreen,  auth: true },
  { name: 'Library',  icon: 'bookmark',   component: LibraryScreen,  auth: true },
  { name: 'Profile',  icon: 'user',       component: ProfileScreen,  auth: true },
];
```

---

## 7. Screen Specifications

### 7.1 Home Screen

**API Calls** (parallel):
- `GET /series/pinned`
- `GET /series/featured`
- `GET /series/discounted`
- `GET /series?sort=latest&limit=6`
- `GET /series?limit=12`
- `GET /series?status=COMPLETED&limit=6`
- `GET /site-config` (announcement banner)

**UI Sections**:
1. **Announcement Banner** — dismissible top banner from site config
2. **Featured Carousel** — full-width swipeable cards (Swiper/FlatList)
3. **Pinned Series** — horizontal scroll of wide poster cards
4. **Bulk Discounted** — horizontal scroll of grid cards with discount badges
5. **Latest Updates** — 2-column grid of poster cards with "updated X ago"
6. **Recently Added** — 3-column grid of compact cover cards
7. **Completed Series** — 3-column grid

**Components Used**: `HeroCarousel`, `HorizontalList`, `PosterCard`, `GridCard`, `AnnounceBanner`, `SectionHeader`

---

### 7.2 Browse / Series List Screen

**API Calls**:
- `GET /series?page=X&limit=20&sort=X&type=X&genre=X&search=X&status=X`

**UI**:
1. **Search bar** at top (debounced, 300ms)
2. **Filter chips**: Type (ALL, MANHWA, MANGA, MANHUA, COMIC), Status (ALL, ONGOING, COMPLETED, HIATUS)
3. **Sort dropdown**: Latest, Popular, Rating, A-Z
4. **Infinite scroll FlatList** of `GridCard` components (3 columns)
5. Pull-to-refresh

---

### 7.3 Series Detail Screen

**API Calls**:
- `GET /series/:slug` (includes chapters, genres, bookmark status, reading progress)

**UI**:
1. **Parallax header** — `bgUrl` as blurred background, `coverUrl` as foreground
2. **Title, rating, type badge, status badge, view count**
3. **Action buttons row**: Bookmark toggle, Share, Start/Continue Reading
4. **Stats row**: Chapters count, Favorites count, Total Views
5. **Genre tags** — horizontal scroll of pill tags
6. **Description** — expandable with "Read More"
7. **Tabs**: Chapters | Reviews
8. **Chapter list** — sortable (newest/oldest), with lock icons and coin cost
9. **Reviews tab** — list of reviews with ratings, "Write Review" button

---

### 7.4 Chapter Reader Screen

**API Calls**:
- `GET /chapters/:slug/:number` (images, locked status, prev/next navigation)
- `POST /user/history` (auto-track reading)
- `POST /points/buy-chapter` (if locked, on user action)

**UI and Features**:
1. **Header bar** (series title, chapter number, settings gear icon)
2. **Reader modes**:
   - **Webtoon/Scroll mode**: Vertical `FlatList` of full-width images (default)
   - **Page mode**: Single image with left/right swipe (`PagerView`)
3. **Settings sheet** (bottom sheet modal):
   - Reading mode toggle (Scroll / Page)
   - Background theme (Dark / Light / Sepia / AMOLED)
   - Image width slider (50% / 75% / 100%)
4. **Navigation**: Prev/Next chapter buttons at bottom
5. **Locked chapter view**: Lock icon + "Unlock for X Coins" button
6. **Ad interstitial**: For free chapters, show an ad before content (5s timer)
7. **Comments section** below reader
8. **Image loading**: Progressive loading with blur placeholders

**Gestures**:
- Long press to prevent screenshots (optional)
- Pinch-to-zoom on images (only in page mode)
- Tap center to toggle header/footer visibility

---

### 7.5 Rewards Center Screen

**API Calls**:
- `GET /ads/active` (custom ad config)
- `POST /ads/earn` (after completing ad pack)

**UI Flow**:
1. **Progress circle** — X of Y ads watched (Y randomized 5-15)
2. **Watch Ad button** — triggers a 5-second simulated ad / real AdMob rewarded ad
3. **Claim button** — appears when all ads watched
4. **Verification timer** — 10-60s random countdown after claiming
5. **Success state** — "+X Points!" animation with confetti
6. **Custom Ad display** — if backend has a custom ad (banner/video/social)

---

### 7.6 Shop Screen

**API Calls**:
- `GET /payments/packages` (or use hardcoded packages matching web)
- `POST /payments/create-checkout-session` — opens Stripe in-app browser

**Packages** (from web source):

| Package | Points | Price |
|---------|--------|-------|
| 100 Points Starter | 100 | $1.00 |
| 500 Points Pro | 500 | $4.50 |
| 1200 Points Mega | 1,200 | $10.00 |
| 3000 Points Ultimate | 3,000 | $24.00 |

> [!IMPORTANT]
> For iOS App Store, you **must** use In-App Purchases (IAP) instead of Stripe for digital goods. Use `react-native-iap` or `expo-in-app-purchases` for iOS, and Stripe for Android/web.

---

### 7.7 Library Screen (Bookmarks + History)

**API Calls**:
- `GET /user/profile` (includes bookmarks and history arrays)

**UI** (Segmented control or tab bar):
1. **Bookmarks tab** — Grid of bookmarked series covers (tap to go to series)
2. **History tab** — Grid of recently read series with last chapter badge

---

### 7.8 Profile Screen

**API Calls**:
- `GET /user/profile`
- `PUT /user/profile` (update name, image)
- `GET /points/balance`

**UI**:
1. **Avatar** with camera button to change photo (upload via `/upload`)
2. **Name** (editable)
3. **Email** (read-only)
4. **Points balance** with coin icon
5. **Referral code** — with share/copy button
6. **Quick links**: Transactions, Bookmarks, History, Shop, Settings
7. **Role badge** (if creator/mod/admin)
8. **Logout button**
9. **Dashboard access** (if role is creator/mod/admin)

---

### 7.9 Auth Screens

**Login Screen**:
- Email input
- Password input
- Sign In button
- "Create account" link
- Referral code input (optional, query param from deep link)

**Register Screen**:
- Name input
- Email input
- Password input
- Confirm password input
- Referral code input (optional)
- Sign Up button
- "Already have an account?" link

---

### 7.10 Chat Room Screen

**API Calls**:
- `GET /community/chat?limit=50`
- `POST /community/chat` (body: `{ content }`)
- `DELETE /community/chat/:id` (mod+)

**UI**:
- Message list (FlatList, inverted)
- Each message: avatar, name, role badge, content, time
- Text input + send button at bottom
- Long press to delete (if own message or mod+)
- Auto-refresh via polling every 5 seconds or WebSocket (future)

---

### 7.11 Search Screen (Modal)

**API Calls**:
- `GET /series?search=TERM&limit=10` (debounced 300ms)

**UI**:
- Full-screen modal with search input auto-focused
- Results as list items with cover thumb, title, type, status
- Recent searches stored locally (MMKV)

---

### 7.12 Dashboard Screens (Creator/Mod/Admin)

> Dashboard screens should be accessible via a drawer or nested stack from profile. Only show relevant options based on user role.

**Creator Dashboard**:
- Overview: Total series, chapters, views, earnings
- My Series: List with edit/delete actions
- Add/Edit Series: Form with image upload, genres multi-select, type/status pickers
- Chapters: List grouped by series
- Add/Edit Chapter: Form with multi-image upload (ordered), lock toggle, coin cost
- Analytics: Charts (views over time, top series)
- Earnings: Total earned, withdrawal request form, withdrawal history
- Featured Requests: Request series to be featured, see status

**Moderator Dashboard** (extends Creator):
- Series Applications: Review pending creator applications (approve/reject)
- Reports: Review user reports (resolve/dismiss)
- Withdrawal Requests: Review pending withdrawals
- User Management: Ban/freeze users
- Featured Requests: Review feature requests

**Admin Dashboard** (extends Moderator):
- All Users: Full user list with role management
- Roles: Assign user/creator/mod/admin roles
- Transactions: System-wide transaction log
- Site Settings: Announcement, social links, referral config, ad config
- Ads Management: CRUD for custom ads (banner/video/social)
- Platform Stats: Total users, series, revenue charts

---

## 8. Reusable Components

### Card Components

| Component | Props | Description |
|-----------|-------|-------------|
| `GridCard` | `series: Series` | Compact cover card (3 per row) with title, type badge |
| `PosterCard` | `series: Series` | Wide card with cover, title, genre tags, rating |
| `ChapterRow` | `chapter, isLocked, coinCost, isPurchased` | Chapter list item with number, title, date, lock icon |

### Layout Components

| Component | Props | Description |
|-----------|-------|-------------|
| `SectionHeader` | `title, viewAllAction?` | Section title with optional "View All" button |
| `HorizontalList` | `data, renderItem, keyExtractor` | Horizontal FlatList with snap behavior |
| `Screen` | `children, scrollable?, header?` | Base screen wrapper with safe areas |
| `EmptyState` | `icon, title, subtitle, actionLabel?, onAction?` | Empty state placeholder |
| `BottomSheet` | `visible, onClose, children` | Reusable bottom sheet modal |

### Interactive Components

| Component | Props | Description |
|-----------|-------|-------------|
| `BookmarkButton` | `seriesId, isBookmarked` | Animated bookmark toggle with haptic feedback |
| `RatingStars` | `rating, editable?, onRate?` | Star rating display/input |
| `PointsBadge` | `points` | Coin icon + points display |
| `FilterChips` | `options, selected, onSelect` | Horizontal scrollable filter chips |
| `AdPlayer` | `onComplete` | Ad viewing component (real AdMob or simulated) |
| `SearchBar` | `value, onChange, placeholder` | Search input with debounce |
| `ImageUpload` | `onUpload` | Camera/gallery picker + upload to `/upload` |

### Feedback Components

| Component | Props | Description |
|-----------|-------|-------------|
| `LoadingSkeleton` | `variant: 'card' / 'list' / 'detail'` | Shimmer loading placeholders |
| `Toast` | N/A (use react-native-toast-message) | Success/error/info toasts |
| `ConfirmDialog` | `title, message, onConfirm, onCancel` | Confirmation modal |

---

## 9. State Management

### 9.1 Zustand Stores

```typescript
// stores/authStore.ts — User session and profile
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  refreshProfile: () => Promise<void>;
}

// stores/pointsStore.ts — Points balance (frequently updated)
interface PointsStore {
  balance: number;
  setBalance: (points: number) => void;
  refreshBalance: () => Promise<void>;
}

// stores/readerStore.ts — Reader preferences (persisted to MMKV)
interface ReaderStore {
  mode: 'scroll' | 'page';
  theme: 'dark' | 'light' | 'sepia' | 'amoled';
  imageWidth: number;  // 50 | 75 | 100
  setMode: (mode: 'scroll' | 'page') => void;
  setTheme: (theme: string) => void;
  setImageWidth: (width: number) => void;
}
```

### 9.2 React Query Keys Convention

```typescript
const queryKeys = {
  series: {
    all: (params) => ['series', params],
    detail: (slug) => ['series', slug],
    pinned: ['series', 'pinned'],
    featured: ['series', 'featured'],
    discounted: ['series', 'discounted'],
  },
  chapters: {
    detail: (slug, number) => ['chapter', slug, number],
  },
  user: {
    profile: ['user', 'profile'],
    bookmarks: ['user', 'bookmarks'],
    history: ['user', 'history'],
  },
  points: {
    balance: ['points', 'balance'],
    transactions: ['points', 'transactions'],
  },
  community: {
    comments: (chapterId) => ['comments', chapterId],
    reviews: (seriesId) => ['reviews', seriesId],
    chat: ['chat'],
  },
  config: ['site-config'],
};
```

---

## 10. Design System & Theming

### 10.1 Color Palette

The web app uses a **dark-first** design. Replicate this in React Native:

```typescript
export const colors = {
  // Core
  background: '#0a0a0a',
  foreground: '#ffffff',
  
  // Primary (Rose Red)
  primary: '#e11d48',
  primaryForeground: '#ffffff',
  
  // Cards (Glass effect — use subtle transparency + blur on iOS)
  card: 'rgba(255, 255, 255, 0.03)',
  cardHover: 'rgba(255, 255, 255, 0.08)',
  
  // Secondary
  secondary: 'rgba(255, 255, 255, 0.05)',
  
  // Muted
  muted: 'rgba(255, 255, 255, 0.02)',
  mutedForeground: 'rgba(255, 255, 255, 0.45)',
  
  // Border
  border: 'rgba(255, 255, 255, 0.06)',
  
  // Accents
  coin: '#f59e0b',       // Points/coins color
  discord: '#5865F2',
  destructive: '#ef4444',
  success: '#22c55e',
  
  // Reader Themes
  readerDark: '#0a0a0a',
  readerLight: '#ffffff',
  readerSepia: '#f4ecd8',
  readerAmoled: '#000000',
};
```

### 10.2 Typography

```typescript
// Fonts to load via expo-font or @expo-google-fonts
export const fonts = {
  heading: 'BebasNeue-Regular',      // Display headings
  sans: 'Poppins-Regular',           // Body text
  sansMedium: 'Poppins-Medium',
  sansSemiBold: 'Poppins-SemiBold',
  sansBold: 'Poppins-Bold',
  sansBlack: 'Poppins-Black',
};

export const fontSizes = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};
```

### 10.3 Spacing & Radius

```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
};

export const radius = {
  sm: 7,
  md: 10,
  lg: 12,
  xl: 18,
  '2xl': 24,
  '3xl': 32,
  full: 999,
};
```

### 10.4 Glass Effect

```typescript
// For iOS, use BlurView from expo-blur
// For Android, use semi-transparent background
import { BlurView } from 'expo-blur';
import { Platform, View } from 'react-native';

const GlassCard = ({ children, style }) => (
  Platform.OS === 'ios' ? (
    <BlurView intensity={12} tint="dark" style={[styles.card, style]}>
      {children}
    </BlurView>
  ) : (
    <View style={[styles.card, { backgroundColor: colors.card }, style]}>
      {children}
    </View>
  )
);
```

---

## 11. Monetization & Ads

### 11.1 Google AdMob Integration

**Publisher ID**: `pub-8848458851675460`

```typescript
// app.json / app.config.ts
{
  "expo": {
    "plugins": [
      ["react-native-google-mobile-ads", {
        "androidAppId": "ca-app-pub-8954395091807116~XXXXXXXXXX",
        "iosAppId": "ca-app-pub-8954395091807116~YYYYYYYYYY"
      }]
    ]
  }
}
```

**Ad Placements**:

| Location | Ad Type | Trigger |
|----------|---------|---------|
| Chapter Reader (free chapters) | Rewarded Interstitial | Before showing chapter images |
| Rewards Center | Rewarded Video | User initiates "Watch Ad" |
| Browse Screen | Banner (320x50) | Bottom of screen |
| Between Series Grid | Native Ad (medium) | Every 10th item in list |

### 11.2 Stripe (Android) / IAP (iOS)

For **Android**: Use Stripe Payment Sheet via `@stripe/stripe-react-native`

```typescript
import { useStripe } from '@stripe/stripe-react-native';

const { initPaymentSheet, presentPaymentSheet } = useStripe();

// 1. Call backend to create checkout session
// 2. Use payment intent client secret with Payment Sheet
// 3. Present native payment UI
```

For **iOS**: Use `react-native-iap` (Apple requires IAP for digital goods)

```typescript
import * as RNIap from 'react-native-iap';

// Define IAP product IDs matching your App Store Connect products
const productIds = ['com.comicbd.points100', 'com.comicbd.points500'];
```

---

## 12. Push Notifications

Use **Expo Push Notifications** or **Firebase Cloud Messaging (FCM)**:

### Notification Types

| Event | Title | Body |
|-------|-------|------|
| New chapter in bookmarked series | "New Chapter!" | "Chapter X of {series} is now available" |
| Points earned | "Points Earned" | "You earned {X} points!" |
| Application approved | "You're a Creator!" | "Your series application has been approved" |
| Withdrawal processed | "Withdrawal Complete" | "Your withdrawal of {X} has been processed" |
| Account banned | "Account Suspended" | "Your account has been suspended" |

> [!NOTE]
> Push notifications require a new backend endpoint to register device tokens. Add `POST /api/v1/user/device-token` to the Express server.

---

## 13. Offline Support & Caching

### 13.1 React Query Persistence

```typescript
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'COMIC_QUERY_CACHE',
});
```

### 13.2 Image Caching

`expo-image` handles disk caching automatically. Configure cache policy:

```typescript
<Image
  source={{ uri: coverUrl }}
  cachePolicy="disk"
  recyclingKey={series.id}
  transition={200}
  placeholder={blurhash}
/>
```

### 13.3 Offline Reading (Future Enhancement)

For downloaded chapters:
- Store chapter image URLs in SQLite/MMKV
- Download images to app file system (`expo-file-system`)
- Serve from local cache when offline

---

## 14. Performance Optimizations

| Area | Optimization |
|------|-------------|
| **Lists** | Use `FlashList` instead of `FlatList` for large series/chapter lists |
| **Images** | Use `expo-image` with blur placeholders and disk caching |
| **Navigation** | Lazy load dashboard screens with `React.lazy` |
| **Bundle** | Enable Hermes engine, tree-shaking, ProGuard (Android) |
| **API** | React Query with `staleTime: 60000` for series lists |
| **Reader** | Preload next 3 images in reader for smooth scrolling |
| **Animations** | Use `react-native-reanimated` for all animations (runs on UI thread) |
| **Memory** | Limit chapter image list window size with `maxToRenderPerBatch` |

---

## 15. Deployment & Build

### 15.1 Expo EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build for stores
eas build --platform android
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

### 15.2 Environment Variables

```bash
# .env
EXPO_PUBLIC_API_URL=https://your-domain.com
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-...
EXPO_PUBLIC_ADMOB_IOS_APP_ID=ca-app-pub-...
```

### 15.3 App Store Requirements

| Requirement | Implementation |
|-------------|---------------|
| **iOS IAP** | Must use Apple IAP for point purchases on iOS |
| **Privacy Policy** | Link in app settings + store listing |
| **Age Rating** | 12+ (comic content) |
| **App Icons** | 1024x1024 adaptive icon |
| **Splash Screen** | Expo splash screen with logo |
| **Deep Linking** | `comicbd://series/:slug`, `comicbd://chapter/:slug/:number` |

---

## 16. Project File Structure

```
comic-native/
├── app.json
├── App.tsx
├── babel.config.js
├── tsconfig.json
├── eas.json
├── .env
│
├── assets/
│   ├── fonts/
│   │   ├── BebasNeue-Regular.ttf
│   │   ├── Poppins-Regular.ttf
│   │   ├── Poppins-Medium.ttf
│   │   ├── Poppins-SemiBold.ttf
│   │   ├── Poppins-Bold.ttf
│   │   └── Poppins-Black.ttf
│   ├── images/
│   │   ├── logo.png
│   │   ├── splash.png
│   │   └── adaptive-icon.png
│   └── animations/
│       ├── loading.json
│       ├── confetti.json
│       └── empty.json
│
├── src/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── queryClient.ts
│   │   └── storage.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── pointsStore.ts
│   │   └── readerStore.ts
│   │
│   ├── hooks/
│   │   ├── useSeries.ts
│   │   ├── useChapters.ts
│   │   ├── useUser.ts
│   │   ├── usePoints.ts
│   │   ├── useCommunity.ts
│   │   └── useAds.ts
│   │
│   ├── services/
│   │   ├── seriesService.ts
│   │   ├── chapterService.ts
│   │   ├── userService.ts
│   │   ├── pointsService.ts
│   │   ├── paymentService.ts
│   │   ├── communityService.ts
│   │   ├── creatorService.ts
│   │   ├── adService.ts
│   │   ├── moderatorService.ts
│   │   └── uploadService.ts
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthStack.tsx
│   │   ├── MainStack.tsx
│   │   ├── BottomTabs.tsx
│   │   ├── DashboardStack.tsx
│   │   └── linking.ts
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── home/
│   │   │   └── HomeScreen.tsx
│   │   ├── browse/
│   │   │   └── BrowseScreen.tsx
│   │   ├── series/
│   │   │   ├── SeriesDetailScreen.tsx
│   │   │   └── ChapterReaderScreen.tsx
│   │   ├── library/
│   │   │   ├── LibraryScreen.tsx
│   │   │   ├── BookmarksTab.tsx
│   │   │   └── HistoryTab.tsx
│   │   ├── rewards/
│   │   │   └── RewardsScreen.tsx
│   │   ├── shop/
│   │   │   └── ShopScreen.tsx
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   └── TransactionsScreen.tsx
│   │   ├── community/
│   │   │   ├── ChatRoomScreen.tsx
│   │   │   └── SearchScreen.tsx
│   │   └── dashboard/
│   │       ├── DashboardHomeScreen.tsx
│   │       ├── SeriesManagementScreen.tsx
│   │       ├── ChapterManagementScreen.tsx
│   │       ├── AddEditSeriesScreen.tsx
│   │       ├── AddEditChapterScreen.tsx
│   │       ├── AnalyticsScreen.tsx
│   │       ├── EarningsScreen.tsx
│   │       ├── UsersScreen.tsx
│   │       ├── RolesScreen.tsx
│   │       ├── ReportsScreen.tsx
│   │       ├── ApplicationsScreen.tsx
│   │       ├── WithdrawalsScreen.tsx
│   │       ├── AdsManagementScreen.tsx
│   │       ├── FeaturedRequestsScreen.tsx
│   │       └── SettingsScreen.tsx
│   │
│   ├── components/
│   │   ├── cards/
│   │   │   ├── GridCard.tsx
│   │   │   ├── PosterCard.tsx
│   │   │   └── ChapterRow.tsx
│   │   ├── layout/
│   │   │   ├── Screen.tsx
│   │   │   ├── SectionHeader.tsx
│   │   │   ├── HorizontalList.tsx
│   │   │   ├── GlassCard.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── interactive/
│   │   │   ├── BookmarkButton.tsx
│   │   │   ├── RatingStars.tsx
│   │   │   ├── PointsBadge.tsx
│   │   │   ├── FilterChips.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── AdPlayer.tsx
│   │   │   └── ImageUpload.tsx
│   │   ├── reader/
│   │   │   ├── ScrollReader.tsx
│   │   │   ├── PageReader.tsx
│   │   │   └── ReaderSettings.tsx
│   │   ├── community/
│   │   │   ├── CommentSection.tsx
│   │   │   ├── ReviewSection.tsx
│   │   │   └── ChatBubble.tsx
│   │   ├── feedback/
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   └── dashboard/
│   │       ├── StatCard.tsx
│   │       ├── DataTable.tsx
│   │       └── SeriesForm.tsx
│   │
│   └── theme/
│       ├── colors.ts
│       ├── fonts.ts
│       ├── spacing.ts
│       └── index.ts
│
└── __tests__/
    ├── screens/
    └── components/
```

---

## 17. Phase-wise Implementation Plan

### Phase 1 — Foundation (Week 1-2)

- [ ] Initialize Expo project with TypeScript
- [ ] Set up theme system (colors, fonts, spacing)
- [ ] Configure React Navigation (bottom tabs + stacks)
- [ ] Set up Axios client with interceptors
- [ ] Configure React Query client
- [ ] Implement authentication (better-auth for RN)
- [ ] Build Login and Register screens
- [ ] Build basic HomeScreen with API data

### Phase 2 — Core Reading (Week 3-4)

- [ ] Build Browse/Series list with search and filters
- [ ] Build Series Detail screen (parallax header, chapter list, genres)
- [ ] Build Chapter Reader (scroll mode + page mode)
- [ ] Implement reader settings (theme, width, mode)
- [ ] Implement reading history auto-tracking
- [ ] Build Bookmark functionality (toggle + library)
- [ ] Build Library screen (bookmarks + history tabs)

### Phase 3 — Monetization (Week 5-6)

- [ ] Integrate Google AdMob (rewarded + banner)
- [ ] Build Rewards Center (ad pack flow)
- [ ] Build Shop screen (point packages)
- [ ] Integrate Stripe for Android payments
- [ ] Integrate IAP for iOS payments
- [ ] Build chapter unlock flow (buy with points)
- [ ] Build Transactions history screen

### Phase 4 — Community (Week 6-7)

- [ ] Build Comment section (on chapters)
- [ ] Build Review section (on series)
- [ ] Build Chat Room screen
- [ ] Build Search modal
- [ ] Build Profile screen with edit capability
- [ ] Implement image upload (avatar, series covers)

### Phase 5 — Dashboard (Week 8-9)

- [ ] Build Creator Dashboard (series/chapter management)
- [ ] Build Add/Edit Series form with image upload
- [ ] Build Add/Edit Chapter form with multi-image upload
- [ ] Build Analytics screen with charts
- [ ] Build Moderator tools (reports, applications, withdrawals)
- [ ] Build Admin tools (users, roles, settings)
- [ ] Build Ads management screen

### Phase 6 — Polish & Deploy (Week 10)

- [ ] Add loading skeletons to all screens
- [ ] Add pull-to-refresh everywhere
- [ ] Add error handling and retry states
- [ ] Implement deep linking (`comicbd://`)
- [ ] Add push notifications
- [ ] Performance testing and optimization
- [ ] Build app icons and splash screen
- [ ] Configure EAS Build for Android + iOS
- [ ] Submit to Google Play Store
- [ ] Submit to Apple App Store

---

## Quick Start Commands

```bash
# Create the project
npx create-expo-app comic-native --template blank-typescript

# Install core dependencies
npx expo install react-native-reanimated react-native-gesture-handler \
  react-native-screens react-native-safe-area-context \
  expo-image expo-secure-store expo-blur expo-av expo-font

# Install navigation
npm install @react-navigation/native @react-navigation/bottom-tabs \
  @react-navigation/native-stack

# Install state management
npm install zustand @tanstack/react-query axios

# Install UI helpers
npm install react-native-toast-message react-native-mmkv

# Install monetization
npm install @stripe/stripe-react-native react-native-google-mobile-ads

# Configure EAS
eas build:configure
```

---

> [!NOTE]
> This specification is generated from a thorough analysis of the existing web codebase. The backend API is **already built and deployed** — the React Native app only needs to consume it via HTTP requests. No backend changes are required unless you want to add mobile-specific features like push notifications (which would need a device token registration endpoint).
