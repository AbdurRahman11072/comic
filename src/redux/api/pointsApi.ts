import { baseApi } from './baseApi';

export interface PointBalanceResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    points: number;
  };
}

export interface TransactionsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    balance: number;
    transactions: Array<{
      id: string;
      userId: string;
      type: string;
      amount: number;
      description: string;
      createdAt: string;
    }>;
  };
}

export const pointsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPointsBalance: builder.query<PointBalanceResponse, void>({
      query: () => '/points/balance',
      providesTags: ['Points'],
    }),

    getTransactions: builder.query<TransactionsResponse, void>({
      query: () => '/points/transactions',
      providesTags: ['Transactions', 'Points'],
    }),

    earnFromAd: builder.mutation<any, { amount?: number }>({
      query: (body) => ({
        url: '/points/earn-ad',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Points', 'Transactions'],
    }),

    buyChapter: builder.mutation<any, { chapterId: string }>({
      query: (body) => ({
        url: '/points/buy-chapter',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Points', 'Transactions', 'Chapters', 'History', 'User'],
    }),

    buyBulkChapters: builder.mutation<
      any,
      { chapterIds: string[]; promoCode?: string }
    >({
      query: (body) => ({
        url: '/points/buy-bulk-chapters',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Points', 'Transactions', 'Chapters', 'History', 'User'],
    }),
  }),
});

export const {
  useGetPointsBalanceQuery,
  useGetTransactionsQuery,
  useEarnFromAdMutation,
  useBuyChapterMutation,
  useBuyBulkChaptersMutation,
} = pointsApi;
