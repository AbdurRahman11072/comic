import { baseApi } from './baseApi';

export interface CreatorPost {
  id: string;
  creatorId: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  isPinned: boolean;
  createdAt: string;
}

export const creatorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicChannel: builder.query<{ success: boolean; data: any }, string>({
      query: (id) => `/creators/channel/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    getCreatorPosts: builder.query<{ success: boolean; data: CreatorPost[] }, string>({
      query: (creatorId) => `/creators/${creatorId}/posts`,
      providesTags: ['User'],
    }),

    createCreatorPost: builder.mutation<
      { success: boolean; data: CreatorPost },
      { title: string; content: string; imageUrl?: string; isPinned?: boolean }
    >({
      query: (body) => ({
        url: '/creators/posts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    deleteCreatorPost: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/creators/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    getCreatorAnalytics: builder.query<{ success: boolean; data: any }, void>({
      query: () => '/creators/analytics',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useGetPublicChannelQuery,
  useGetCreatorPostsQuery,
  useCreateCreatorPostMutation,
  useDeleteCreatorPostMutation,
  useGetCreatorAnalyticsQuery,
} = creatorApi;
