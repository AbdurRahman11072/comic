// shared data types used across home components
export interface Chapter {
  name: string;
  href: string;
  date: string;
  isLocked?: boolean;
  isNew?: boolean;
  isFree?: boolean;
}

export interface SeriesCard {
  title: string;
  subtitle?: string;
  image: string;
  href: string;
  type: string;
  isPinned?: boolean;
  isNew?: boolean;
  isCompleted?: boolean;
  discount?: string;
  chapters?: Chapter[];
}
