import { baseApi } from './baseApi';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query<{ success: boolean; data: any }, void>({
      query: () => '/user/profile',
      providesTags: ['User', 'Bookmarks', 'History'],
    }),

    toggleBookmark: builder.mutation<any, { seriesId: string }>({
      query: (body) => ({
        url: '/user/bookmarks/toggle',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Bookmarks', 'User', 'Series'],
    }),

    updateHistory: builder.mutation<any, { seriesId: string; chapterId: string }>({
      query: (body) => ({
        url: '/user/history',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['History', 'User'],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useToggleBookmarkMutation,
  useUpdateHistoryMutation,
} = userApi;
