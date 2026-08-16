import { baseApi } from './baseApi';

export const chapterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChapterByNumber: builder.query<
      { success: boolean; data: any },
      { slug: string; number: number }
    >({
      query: ({ slug, number }) => `/chapters/${slug}/${number}`,
      providesTags: (result, error, { slug, number }) => [
        { type: 'Chapters', id: `${slug}-${number}` },
      ],
    }),

    getChapterById: builder.query<{ success: boolean; data: any }, string>({
      query: (id) => `/chapters/${id}`,
      providesTags: (result, error, id) => [{ type: 'Chapters', id }],
    }),
  }),
});

export const { useGetChapterByNumberQuery, useGetChapterByIdQuery } = chapterApi;
