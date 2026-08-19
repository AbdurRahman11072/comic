import { createAuthClient } from 'better-auth/react';

const getAuthBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return `http://127.0.0.1:${process.env.PORT || 5000}`;
};

export const authClient = createAuthClient({
  baseURL: getAuthBaseUrl(),
  fetchOptions: {
    credentials: 'include',
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;
