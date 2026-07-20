
export const env = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  // Base URL for the backend (without /api/auth). Used by proxy.ts, auth-client.ts and user.service.ts.
  NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:5000',
};
