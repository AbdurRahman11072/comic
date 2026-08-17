import { baseApi } from './baseApi';

export interface PointBalanceResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    points: number;
    transactionsFrozen?: boolean;
    dailyAdViews?: number;
    dailyAdPointsEarned?: number;
  };
}

export interface TransactionsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    balance: number;
    transactionsFrozen?: boolean;
    enableCashOut?: boolean;
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

    earnFromAd: builder.mutation<any, { amount?: number; adsCount?: number }>({
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

    getMyWithdrawals: builder.query<{ statusCode: number; success: boolean; data: any[] }, void>({
      query: () => '/points/my-withdrawals',
      providesTags: ['Transactions', 'Points'],
    }),

    requestCashOut: builder.mutation<
      any,
      {
        pointsRequested: number;
        bankDetails?: string;
        paymentMethod?: string;
        accountNumber?: string;
        accountName?: string;
        notes?: string;
      }
    >({
      query: (body) => ({
        url: '/points/withdraw',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Points', 'Transactions'],
    }),
  }),
});

export const {
  useGetPointsBalanceQuery,
  useGetTransactionsQuery,
  useEarnFromAdMutation,
  useBuyChapterMutation,
  useBuyBulkChaptersMutation,
  useGetMyWithdrawalsQuery,
  useRequestCashOutMutation,
} = pointsApi;
