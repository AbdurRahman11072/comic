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

  // If no cookie exists, redirect to login/home
  if (!cookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    // 2. Fetch session from backend
    // better-auth endpoint to fetch session from cookies
    const backendUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:5000';
    const res = await fetch(`${backendUrl}/api/auth/get-session`, {
      headers: {
        cookie,
      },
    });

    if (!res.ok) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const sessionData = await res.json();
    const userRole = sessionData?.user?.role || 'user';

    // 3. User is not allowed in dashboard at all
    if (userRole === 'user') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // 4. Role-based route protection

    // Admin Only
    if (
      path.startsWith('/dashboard/payments') ||
      path.startsWith('/dashboard/roles') ||
      path.startsWith('/dashboard/settings')
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
      path.startsWith('/dashboard/comments') ||
      path.startsWith('/dashboard/ads')
    ) {
      if (!['admin', 'moderator'].includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Creator Only
    // Wait, creators have earnings and channel. But technically admins could view them? 
    // In our sidebar, 'Earnings' is only for 'creator'. Let's strictly enforce it.
    if (
      path.startsWith('/dashboard/earnings') ||
      path.startsWith('/dashboard/channel')
    ) {
      if (!['creator', 'admin'].includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Series & Chapters (Creator, Moderator, Admin can access, so we do nothing here since 'user' is already kicked out)

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware session fetch error:', error);
    // On fetch error, err on the side of caution
    return NextResponse.redirect(new URL('/', request.url));
  }
}
