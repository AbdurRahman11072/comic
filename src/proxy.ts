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
  const cookie = request.headers.get('cookie');

  // 1. If no session cookie exists, redirect immediately to login prompt
  if (!cookie) {
    if (path.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/creator-benefits', request.url));
    }
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('login', 'true');
    return NextResponse.redirect(loginUrl);
  }

  try {
    // 2. Fetch session from backend using local loopback port with forwarded headers
    const backendUrl = `http://127.0.0.1:${process.env.PORT || 5000}`;
    const proto =
      request.headers.get('x-forwarded-proto') ||
      request.nextUrl.protocol.replace(':', '') ||
      'http';
    const host =
      request.headers.get('x-forwarded-host') ||
      request.headers.get('host') ||
      request.nextUrl.host;

    const res = await fetch(`${backendUrl}/api/auth/get-session`, {
      headers: {
        cookie,
        'x-forwarded-proto': proto,
        'x-forwarded-host': host,
        host: host,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      // If session is invalid/expired, redirect to login
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('login', 'true');
      return NextResponse.redirect(loginUrl);
    }

    const sessionData = await res.json();
    const user = sessionData?.user;

    // If session returns no user, redirect to login
    if (!user) {
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('login', 'true');
      return NextResponse.redirect(loginUrl);
    }

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

    return NextResponse.next();
  } catch (error) {
    console.error('[Proxy Middleware] Session fetch error:', error);
    // Fallback: let Server Components handle authentication rendering
    return NextResponse.next();
  }
}
