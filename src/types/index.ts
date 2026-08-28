export interface Chapter {
  id: string;
  seriesId: string;
  number: number;
  title: string | null;
  language?: string;
  isLocked: boolean;
  isPurchased?: boolean;
  coinCost: number;
  createdAt: string;
}

export interface CreateChapterDTO {
  seriesId: string;
  number: number;
  title?: string;
  language?: string;
  isLocked?: boolean;
  coinCost?: number;
  images: { url: string; order: number }[];
}

export interface Genre {
  id: string;
  name: string;
}

export interface Series {
  id: string;
  creatorId?: string | null;
  title: string;
  slug: string;
  altTitles?: string;
  description?: string;
  coverUrl?: string;
  bgUrl?: string;
  type: string;
  status: string;
  rating: number;
  favorites: number;
  totalViews: number;
  isPinned: boolean;
  featured?: any;
  discount?: string;
  genres: Genre[];
  chapters?: Chapter[];
  creator?: {
    id: string;
    name?: string;
    email?: string | null;
    image?: string | null;
    channelId?: string;
    channelName?: string;
    profileImage?: string | null;
    bannerUrl?: string | null;
    description?: string | null;
    creatorProfile?: {
      id: string;
      channelName: string;
      profileImage?: string | null;
      bannerUrl?: string | null;
      description?: string | null;
    } | null;
    user?: {
      id: string;
      name: string;
      email?: string;
      image?: string | null;
    } | null;
  } | null;
  _count?: {
    chapters: number;
    reports?: number;
    bookmarks?: number;
  };
}

export interface SeriesResponse {
  data: Series[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface CreateSeriesDTO {
  title: string;
  altTitles?: string;
  description?: string;
  type: string;
  status: string;
  coverUrl?: string;
  bgUrl?: string;
  genres: string[];
}

export interface PointBalance {
  points: number;
}

export interface PointTransaction {
  id: string;
  userId: string;
  type: 'EARN_AD' | 'BUY_CHAPTER';
  amount: number;
  description: string;
  createdAt: string;
}

export interface TransactionsResponse {
  balance: number;
  transactions: PointTransaction[];
}

export interface EarnAdResponse {
  points: number;
  transaction: PointTransaction;
}

export interface BuyChapterResponse {
  points: number;
  transaction: PointTransaction;
  purchase: { id: string; userId: string; chapterId: string; pointsSpent: number; createdAt: string };
}
