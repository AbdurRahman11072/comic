import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Configuration to only run middleware on /dashboard routes
export const config = {
  matcher: ['/dashboard/:path*'],
};

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Get the session cookie from the request
  const cookie = request.headers.get('cookie');

  // If no cookie exists at all, redirect to login/home
  if (!cookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    // 2. Fetch session from backend using local loopback port with forwarded headers
    const backendUrl = `http://127.0.0.1:${process.env.PORT || 5000}`;
    const proto = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '') || 'http';
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host;

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
      // If loopback fetch failed or returned 401, allow request to proceed to layout server component
      return NextResponse.next();
    }

    const sessionData = await res.json();
    const userRole = sessionData?.user?.role || 'user';

    // 3. User is not allowed in dashboard at all
    if (sessionData?.user && userRole === 'user') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // 4. Role-based route protection

    // Admin Only
    if (
      path.startsWith('/dashboard/payments') ||
      path.startsWith('/dashboard/roles') ||
      path.startsWith('/dashboard/settings') ||
      path.startsWith('/dashboard/backup') ||
      path.startsWith('/dashboard/audit')
    ) {
      if (userRole !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Moderator and Admin Only
    if (
      path.startsWith('/dashboard/users') ||
      path.startsWith('/dashboard/applications') ||
      path.startsWith('/dashboard/withdrawals') ||
      path.startsWith('/dashboard/cashout') ||
      path.startsWith('/dashboard/reports') ||
      path.startsWith('/dashboard/admin-series') ||
      path.startsWith('/dashboard/creators')
    ) {
      if (!['moderator', 'admin'].includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Creator Only (Authoring)
    if (
      path.startsWith('/dashboard/series/add') ||
      path.startsWith('/dashboard/series/edit') ||
      path.startsWith('/dashboard/chapters/add') ||
      path.startsWith('/dashboard/chapters/edit')
    ) {
      if (userRole !== 'creator') {
        return NextResponse.redirect(new URL('/dashboard/series', request.url));
      }
    }

    // Creator and Admin Only
    if (
      path.startsWith('/dashboard/earnings') ||
      path.startsWith('/dashboard/promos') ||
      path.startsWith('/dashboard/channel')
    ) {
      if (!['creator', 'admin'].includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware session fetch error:', error);
    // Let dashboard layout server component handle auth verification on fallback
    return NextResponse.next();
  }
}
