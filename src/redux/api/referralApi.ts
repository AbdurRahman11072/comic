import { baseApi } from './baseApi';

export interface ReferredUser {
  id: string;
  name: string;
  image?: string | null;
  joinedAt: string;
  isActive: boolean;
}

export interface ReferralStatsData {
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  totalPointsEarned: number;
  referralBonusPercent: number;
  referralActiveMonths: number;
  referralSignupBonus: number;
  recentReferrals: ReferredUser[];
}

export interface ReferralValidationData {
  valid: boolean;
  referrerName: string;
  referrerAvatar?: string | null;
  referralCode: string;
  signupBonusPoints: number;
}

export const referralApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReferralStats: builder.query<{ success: boolean; data: ReferralStatsData }, void>({
      query: () => '/referrals/stats',
      providesTags: ['Referrals', 'Points', 'User'],
    }),

    validateReferralCode: builder.query<
      { success: boolean; data: ReferralValidationData },
      string
    >({
      query: (code) => `/referrals/validate/${code}`,
    }),
  }),
});

export const { useGetReferralStatsQuery, useLazyValidateReferralCodeQuery } = referralApi;
