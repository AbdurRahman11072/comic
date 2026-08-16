import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/v1`
      : '/api/v1',
    credentials: 'include', // Send session cookies for better-auth
  }),
  tagTypes: [
    'Points',
    'Transactions',
    'Series',
    'Chapters',
    'Bookmarks',
    'History',
    'Comments',
    'Reviews',
    'Chat',
    'User',
    'SiteConfig',
  ],
  endpoints: () => ({}),
});
