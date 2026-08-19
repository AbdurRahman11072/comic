import api from '@/lib/api';

export interface DashboardStatsResponse {
  scope: 'PLATFORM' | 'CREATOR';
  overview: {
    totalUsers?: number;
    userGrowth?: number;
    activeSeries: number;
    totalSeries: number;
    seriesGrowth?: number;
    totalViews: number;
    viewsGrowth?: number;
    netRevenue?: number;
    revenueGrowth?: number;
    totalBookmarks?: number;
    totalRevenue?: number;
    totalChapters?: number;
    totalCreators?: number;
  };
  revenueChart: Array<{
    name: string;
    revenue: number;
  }>;
  contentDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  recentReports: Array<{
    id: string;
    user: string;
    type: string;
    subject: string;
    status: string;
    date: string;
  }>;
}

export const statsService = {
  getStats: async (): Promise<{ success: boolean; data: DashboardStatsResponse }> => {
    const res = await api.get('/api/v1/stats');
    return res.data;
  },
};
