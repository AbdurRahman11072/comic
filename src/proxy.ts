import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Route protection middleware matching all private consumer and dashboard endpoints.
 */
export const config = {
  matcher: [
    '/profile',
    '/bookmarks',
    '/history',
    '/transactions',
    '/dashboard/:path*',
    '/stripe-sandbox',
  ],
};

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const cookie = request.headers.get('cookie') || '';

  // Check if better-auth session token cookie exists (supporting standard & secure cookies)
  const hasSessionToken =
    cookie.includes('better-auth.session_token') ||
    cookie.includes('__Secure-better-auth.session_token');

  // 1. If no session cookie exists at all, redirect immediately
  if (!hasSessionToken) {
    if (path.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/creator-benefits', request.url));
    }
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('login', 'true');
    return NextResponse.redirect(loginUrl);
  }

  try {
    // 2. Resolve backend URL dynamically with environment & origin awareness
    const originUrl = request.nextUrl.origin;
    const proto =
      request.headers.get('x-forwarded-proto') ||
      request.nextUrl.protocol.replace(':', '') ||
      'https';
    const host =
      request.headers.get('x-forwarded-host') ||
      request.headers.get('host') ||
      request.nextUrl.host;

    const backendUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.RENDER_EXTERNAL_URL ||
      process.env.BETTER_AUTH_URL ||
      originUrl ||
      `http://127.0.0.1:${process.env.PORT || 5000}`;

    const res = await fetch(`${backendUrl}/api/auth/get-session`, {
      headers: {
        cookie,
        'x-forwarded-proto': proto,
        'x-forwarded-host': host,
        host: host,
        origin: `${proto}://${host}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const sessionData = await res.json();
      const user = sessionData?.user;

      if (user) {
        const userRole = (user.role || 'user').toLowerCase();

        // ── TIER 2: AUTHENTICATED USER ROUTES ──
        if (
          path === '/profile' ||
          path === '/bookmarks' ||
          path === '/history' ||
          path === '/transactions'
        ) {
          // Any authenticated role is allowed
          return NextResponse.next();
        }

        // ── DEVELOPER SANDBOX ──
        if (path.startsWith('/stripe-sandbox')) {
          if (userRole !== 'admin' && process.env.NODE_ENV === 'production') {
            return NextResponse.redirect(new URL('/', request.url));
          }
          return NextResponse.next();
        }

        // ── TIER 3–5: DASHBOARD ROUTES ──
        if (path.startsWith('/dashboard')) {
          // Normal readers are not staff — guide them to the Creator Benefits onboarding page
          if (userRole === 'user') {
            return NextResponse.redirect(new URL('/creator-benefits', request.url));
          }

          // 1. Admin-Only System Routes
          if (
            path.startsWith('/dashboard/revenue-distribution') ||
            path.startsWith('/dashboard/payments') ||
            path.startsWith('/dashboard/roles') ||
            path.startsWith('/dashboard/settings') ||
            path.startsWith('/dashboard/ads') ||
            path.startsWith('/dashboard/cms') ||
            path.startsWith('/dashboard/backup') ||
            path.startsWith('/dashboard/audit')
          ) {
            if (userRole !== 'admin') {
              return NextResponse.redirect(new URL('/dashboard', request.url));
            }
          }

          // 2. Moderator and Admin Only Routes
          if (
            path.startsWith('/dashboard/users') ||
            path.startsWith('/dashboard/applications') ||
            path.startsWith('/dashboard/withdrawals') ||
            path.startsWith('/dashboard/reports') ||
            path.startsWith('/dashboard/comments') ||
            path.startsWith('/dashboard/admin-series') ||
            path.startsWith('/dashboard/creators') ||
            path.startsWith('/dashboard/featured-requests')
          ) {
            if (!['moderator', 'admin'].includes(userRole)) {
              return NextResponse.redirect(new URL('/dashboard', request.url));
            }
          }

          // 3. Creator and Admin Only Studio Routes
          if (
            path.startsWith('/dashboard/channel') ||
            path.startsWith('/dashboard/series') ||
            path.startsWith('/dashboard/chapters') ||
            path.startsWith('/dashboard/analytics') ||
            path.startsWith('/dashboard/earnings') ||
            path.startsWith('/dashboard/promos') ||
            path.startsWith('/dashboard/cashout')
          ) {
            if (!['creator', 'admin'].includes(userRole)) {
              return NextResponse.redirect(new URL('/dashboard', request.url));
            }
          }

          return NextResponse.next();
        }
      }
    }

    // If fetch failed or returned non-200 but cookie token is present,
    // let Server Components (layout.tsx) handle authoritative session verification
    return NextResponse.next();
  } catch (error) {
    console.error('[Proxy Middleware] Session fetch error:', error);
    // Fallback: let Server Components handle authentication rendering
    return NextResponse.next();
  }
}
