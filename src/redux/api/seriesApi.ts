import { baseApi } from './baseApi';
import { Series } from '@/types';

export interface SeriesListResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: Series[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export const seriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSeries: builder.query<SeriesListResponse, Record<string, any> | void>({
      query: (params) => ({
        url: '/series',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Series' as const, id })),
              { type: 'Series', id: 'LIST' },
            ]
          : [{ type: 'Series', id: 'LIST' }],
    }),

    getPinnedSeries: builder.query<{ success: boolean; data: Series[] }, void>({
      query: () => '/series/pinned',
      providesTags: [{ type: 'Series', id: 'PINNED' }],
    }),

    getFeaturedSeries: builder.query<{ success: boolean; data: Series[] }, void>({
      query: () => '/series/featured',
      providesTags: [{ type: 'Series', id: 'FEATURED' }],
    }),

    getDiscountedSeries: builder.query<{ success: boolean; data: Series[] }, void>({
      query: () => '/series/discounted',
      providesTags: [{ type: 'Series', id: 'DISCOUNTED' }],
    }),

    getSeriesBySlug: builder.query<{ success: boolean; data: Series }, string>({
      query: (slug) => `/series/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Series', id: slug }],
    }),
  }),
});

export const {
  useGetAllSeriesQuery,
  useGetPinnedSeriesQuery,
  useGetFeaturedSeriesQuery,
  useGetDiscountedSeriesQuery,
  useGetSeriesBySlugQuery,
} = seriesApi;
