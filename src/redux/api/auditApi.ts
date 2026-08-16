import { baseApi } from './baseApi';

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  details?: Record<string, any> | null;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string | null;
  };
}

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<
      {
        success: boolean;
        data: AuditLog[];
        pagination?: { total: number; page: number; limit: number };
      },
      { page?: number; limit?: number; action?: string; targetType?: string } | void
    >({
      query: (params) => ({
        url: '/audit',
        params: params || {},
      }),
      providesTags: ['SiteConfig'],
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditApi;
