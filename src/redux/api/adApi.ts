import { baseApi } from './baseApi';

export const adApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdByPlacement: builder.query<any, string>({
      query: (placement) => `/api/v1/ads/placement/${placement}`,
      providesTags: (result, error, placement) => [{ type: 'Ad' as any, id: placement }],
    }),
    recordAdImpression: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/v1/ads/${id}/impression`,
        method: 'POST',
      }),
    }),
    recordAdClick: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/v1/ads/${id}/click`,
        method: 'POST',
      }),
    }),
    earnAdPoints: builder.mutation<any, { adId?: string }>({
      query: (body) => ({
        url: '/api/v1/ads/earn',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Points' as any],
    }),
    getAdStats: builder.query<any, void>({
      query: () => '/api/v1/ads/stats',
      providesTags: ['Ad' as any],
    }),
    getAdminAds: builder.query<any, any>({
      query: (params) => ({
        url: '/api/v1/ads',
        params,
      }),
      providesTags: ['Ad' as any],
    }),
    createAdminAd: builder.mutation<any, any>({
      query: (body) => ({
        url: '/api/v1/ads',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Ad' as any],
    }),
    updateAdminAd: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/api/v1/ads/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Ad' as any],
    }),
    deleteAdminAd: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/v1/ads/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Ad' as any],
    }),
  }),
});

export const {
  useGetAdByPlacementQuery,
  useRecordAdImpressionMutation,
  useRecordAdClickMutation,
  useEarnAdPointsMutation,
  useGetAdStatsQuery,
  useGetAdminAdsQuery,
  useCreateAdminAdMutation,
  useUpdateAdminAdMutation,
  useDeleteAdminAdMutation,
} = adApi;
