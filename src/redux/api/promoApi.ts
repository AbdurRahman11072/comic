import { baseApi } from './baseApi';

export interface PromoCode {
  id: string;
  code: string;
  creatorId?: string | null;
  seriesId?: string | null;
  pointsReward: number;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
  creator?: {
    id: string;
    name: string;
    image?: string | null;
  } | null;
}

export const promoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPromoCodes: builder.query<{ success: boolean; data: PromoCode[] }, void>({
      query: () => '/promo',
      providesTags: ['SiteConfig'],
    }),

    createPromoCode: builder.mutation<
      { success: boolean; data: PromoCode },
      {
        code: string;
        pointsReward?: number;
        discountPercent?: number;
        maxUses?: number;
        expiresAt?: string | null;
        seriesId?: string | null;
      }
    >({
      query: (body) => ({
        url: '/promo',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SiteConfig'],
    }),

    deletePromoCode: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/promo/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SiteConfig'],
    }),

    redeemPromoCode: builder.mutation<
      {
        success: boolean;
        message: string;
        data: {
          code: string;
          pointsAwarded: number;
          discountPercent: number;
          newBalance: number;
        };
      },
      { code: string }
    >({
      query: (body) => ({
        url: '/promo/redeem',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Points', 'Transactions', 'User'],
    }),
  }),
});

export const {
  useGetPromoCodesQuery,
  useCreatePromoCodeMutation,
  useDeletePromoCodeMutation,
  useRedeemPromoCodeMutation,
} = promoApi;
