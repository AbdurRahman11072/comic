import { env } from '@/env';

export interface TrackReadPayload {
  sessionId: string;
  seriesId: string;
  chapterId: string;
  durationSeconds: number;
  pagesViewed: number;
  totalPages: number;
  completionPercent: number;
  scrollDepthPercent?: number;
  interactionCount?: number;
  isExitBeacon?: boolean;
}

export interface CreatorDistributionItem {
  creatorId: string;
  userId: string;
  channelName: string;
  profileImage: string | null;
  ownerName: string;
  ownerEmail: string;
  qualityScore: number;
  scorePercentage: number;
  qualifiedReadsCount: number;
  engagedReadsCount: number;
  completedReadsCount: number;
  totalReadsCount: number;
  pointsAwarded: number;
  fiatEquivalent: number;
}

export interface DistributionPreviewData {
  periodStart: string;
  periodEnd: string;
  grossAmountEntered: number;
  currency: 'USD' | 'POINTS';
  pointRate: number;
  distributablePool: number;
  totalPlatformQualityScore: number;
  totalQualifiedReads: number;
  totalEngagedReads: number;
  totalCompletedReads: number;
  totalDeduplicatedReads: number;
  telemetry: {
    totalRawEvents: number;
    totalBotEvents: number;
    totalGuestEvents: number;
    totalQualifyingEvents: number;
  };
  overlappingRun: {
    id: string;
    periodStart: string;
    periodEnd: string;
    grossAmountEntered: number;
    currency: string;
  } | null;
  creators: CreatorDistributionItem[];
}

export interface DistributionRunItem {
  id: string;
  adminId: string;
  periodStart: string;
  periodEnd: string;
  grossAmountEntered: number;
  currency: string;
  distributablePool: number;
  totalQualityScore: number;
  totalQualifiedReads: number;
  totalEngagedReads: number;
  totalCompletedReads: number;
  totalCreatorsCount: number;
  status: 'COMPLETED' | 'REVERTED';
  revertedAt?: string | null;
  revertedBy?: string | null;
  notes?: string | null;
  createdAt: string;
  admin?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    creatorPayouts: number;
  };
  creatorPayouts?: Array<{
    id: string;
    creatorId: string;
    qualityScore: number;
    scorePercentage: number;
    qualifiedReadsCount: number;
    engagedReadsCount: number;
    completedReadsCount: number;
    totalReadsCount: number;
    pointsAwarded: number;
    fiatEquivalent: number;
    revertedPoints: number;
    shortfallPoints: number;
    creator?: {
      id: string;
      channelName: string;
      profileImage: string | null;
      user?: {
        id: string;
        name: string;
        email: string;
      };
    };
  }>;
}

export const adRevenueService = {
  /**
   * Sends active reading progress heartbeat
   */
  async trackProgress(payload: TrackReadPayload) {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/ad-revenue/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  /**
   * Fires exit beacon on tab close or chapter unmount
   */
  sendExitBeacon(payload: TrackReadPayload) {
    if (typeof window === 'undefined') return;
    const url = `${env.NEXT_PUBLIC_API_URL}/api/v1/ad-revenue/track`;
    const data = JSON.stringify({ ...payload, isExitBeacon: true });

    if (navigator.sendBeacon) {
      const blob = new Blob([data], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: data,
        keepalive: true,
      }).catch(() => {});
    }
  },

  /**
   * Calculates a dry-run preview of the revenue distribution
   */
  async getPreview(params: {
    periodStart: string;
    periodEnd: string;
    amount: number;
    currency?: 'USD' | 'POINTS';
  }): Promise<{ success: boolean; data?: DistributionPreviewData; message?: string }> {
    try {
      const query = new URLSearchParams({
        periodStart: params.periodStart,
        periodEnd: params.periodEnd,
        amount: String(params.amount),
        currency: params.currency || 'USD',
      });
      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/ad-revenue/distribution/preview?${query.toString()}`,
        {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to calculate preview' };
    }
  },

  /**
   * Executes atomic revenue distribution and credits creator points
   */
  async executeDistribution(payload: {
    periodStart: string;
    periodEnd: string;
    amount: number;
    currency?: 'USD' | 'POINTS';
    notes?: string;
  }): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/ad-revenue/distribution/execute`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to execute distribution' };
    }
  },

  /**
   * Fetches past distribution runs history
   */
  async getHistory(
    page = 1,
    limit = 20
  ): Promise<{
    success: boolean;
    data?: DistributionRunItem[];
    meta?: any;
    message?: string;
  }> {
    try {
      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/ad-revenue/distribution/history?page=${page}&limit=${limit}`,
        {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to fetch history' };
    }
  },

  /**
   * Fetches detailed breakdown of a specific distribution run
   */
  async getDetails(
    id: string
  ): Promise<{ success: boolean; data?: DistributionRunItem; message?: string }> {
    try {
      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/ad-revenue/distribution/${id}`,
        {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to fetch run details' };
    }
  },

  /**
   * Reverts a completed revenue distribution run
   */
  async revertDistribution(
    id: string,
    revertReason?: string
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/ad-revenue/distribution/${id}/revert`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ revertReason }),
        }
      );
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to revert distribution' };
    }
  },
};
