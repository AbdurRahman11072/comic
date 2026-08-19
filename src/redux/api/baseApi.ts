import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '/api/v1';
  }
  return `http://127.0.0.1:${process.env.PORT || 5000}/api/v1`;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
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
    'Ad',
    'Withdrawals',
  ],
  endpoints: () => ({}),
});
