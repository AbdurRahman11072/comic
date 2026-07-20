export interface Chapter {
  id: string;
  seriesId: string;
  number: number;
  title: string | null;
  isLocked: boolean;
  isPurchased?: boolean;
  coinCost: number;
  createdAt: string;
}

export interface CreateChapterDTO {
  seriesId: string;
  number: number;
  title?: string;
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
  _count?: {
    chapters: number;
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
