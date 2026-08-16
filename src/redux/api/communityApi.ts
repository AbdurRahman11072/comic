import { baseApi } from './baseApi';

export const communityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query<{ success: boolean; data: any[] }, string>({
      query: (chapterId) => `/community/comments/${chapterId}`,
      providesTags: (result, error, chapterId) => [
        { type: 'Comments', id: chapterId },
      ],
    }),

    createComment: builder.mutation<
      any,
      { chapterId: string; content: string }
    >({
      query: (body) => ({
        url: '/community/comments',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { chapterId }) => [
        { type: 'Comments', id: chapterId },
      ],
    }),

    deleteComment: builder.mutation<any, { commentId: string; chapterId?: string }>({
      query: ({ commentId }) => ({
        url: `/community/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { chapterId }) =>
        chapterId ? [{ type: 'Comments', id: chapterId }] : ['Comments'],
    }),

    getChatMessages: builder.query<{ success: boolean; data: any[] }, void>({
      query: () => '/community/chat',
      providesTags: ['Chat'],
    }),

    sendChatMessage: builder.mutation<any, { content: string }>({
      query: (body) => ({
        url: '/community/chat',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Chat'],
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useGetChatMessagesQuery,
  useSendChatMessageMutation,
} = communityApi;
