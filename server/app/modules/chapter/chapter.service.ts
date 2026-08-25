import httpStatus from 'http-status';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { prisma } from '../../../lib/prisma';
import AppError from '../../error/AppError';
import { deleteFromCloudinary } from '../../utils/cloudinary';
import { cacheService } from '../../utils/redis';

const formatCreator = (c: any) => {
  if (!c) return null;
  return {
    id: c.user?.id || c.userId || c.id,
    name: c.channelName || c.user?.name || 'Creator Studio',
    email: c.user?.email || null,
    image: c.profileImage || c.user?.image || null,
    channelId: c.id,
    channelName: c.channelName,
    profileImage: c.profileImage,
    bannerUrl: c.bannerUrl,
    description: c.description,
    creatorProfile: {
      id: c.id,
      channelName: c.channelName,
      profileImage: c.profileImage,
      bannerUrl: c.bannerUrl,
      description: c.description,
    },
    user: c.user || null,
  };
};

const isPremiumChaptersEnabled = async (): Promise<boolean> => {
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { id: 'global' },
      select: { enablePremiumChapters: true },
    });
    return (config as any)?.enablePremiumChapters ?? true;
  } catch (e) {
    return true;
  }
};

const getChapterByNumber = async (seriesSlug: string, number: number, userId?: string) => {
  const cacheKey = `cache:chapter:${seriesSlug}:${number}`;
  let baseChapterData = await cacheService.get<any>(cacheKey);

  if (!baseChapterData) {
    const series = await prisma.series.findUnique({
      where: { slug: seriesSlug },
      select: { id: true },
    });

    if (!series) return null;

    const [result, premiumEnabled] = await Promise.all([
      prisma.chapter.findFirst({
        where: { 
          seriesId: series.id,
          number: Number(number),
        },
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
          series: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverUrl: true,
              creator: {
                select: {
                  id: true,
                  channelName: true,
                  profileImage: true,
                  description: true,
                  bannerUrl: true,
                  userId: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      isPremiumChaptersEnabled(),
    ]);
    
    if (!result) return null;

    // Find prev and next chapters in parallel
    const [prevChapter, nextChapter] = await Promise.all([
      prisma.chapter.findFirst({
        where: {
          seriesId: result.seriesId,
          number: { lt: result.number },
        },
        orderBy: { number: 'desc' },
        select: { number: true },
      }),
      prisma.chapter.findFirst({
        where: {
          seriesId: result.seriesId,
          number: { gt: result.number },
        },
        orderBy: { number: 'asc' },
        select: { number: true },
      }),
    ]);

    let chapterSeries = result.series;
    if (chapterSeries) {
      const creator = formatCreator(chapterSeries.creator);
      chapterSeries = {
        ...chapterSeries,
        creator: creator as any,
      };
    }

    baseChapterData = {
      ...result,
      series: chapterSeries,
      premiumEnabled,
      prevChapterNumber: prevChapter?.number || null,
      nextChapterNumber: nextChapter?.number || null,
    };

    await cacheService.set(cacheKey, baseChapterData, 1800);
  }

  // Increment series total views asynchronously
  if (baseChapterData.series?.id) {
    prisma.series.update({
      where: { id: baseChapterData.series.id },
      data: { totalViews: { increment: 1 } },
    }).catch(() => null);
  }

  // If premium chapters are disabled globally by admin, all chapters are unlocked & free
  const effectivelyLocked = baseChapterData.premiumEnabled ? baseChapterData.isLocked : false;

  // Check if the authenticated user already purchased this chapter
  let isPurchased = !effectivelyLocked;
  if (userId && effectivelyLocked) {
    const purchase = await prisma.chapterPurchase.findUnique({
      where: { userId_chapterId: { userId, chapterId: baseChapterData.id } },
    });
    isPurchased = !!purchase;
  }

  return {
    ...baseChapterData,
    isLocked: effectivelyLocked,
    coinCost: effectivelyLocked ? baseChapterData.coinCost : 0,
    images: (effectivelyLocked && !isPurchased) ? [] : baseChapterData.images,
    isPurchased: !effectivelyLocked || isPurchased,
  };
};

const getAllChapters = async (query: any) => {
  const { page = 1, limit = 10, seriesId, creatorId } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (seriesId) where.seriesId = seriesId;
  if (creatorId) {
    where.series = {
      OR: [
        { creatorId },
        { creator: { userId: creatorId } },
      ],
    };
  }

  const result = await prisma.chapter.findMany({
    where,
    skip,
    take: Number(limit),
    orderBy: { createdAt: 'desc' },
    include: {
      series: {
        select: { title: true },
      },
    },
  });

  const total = await prisma.chapter.count({ where });

  return {
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
    },
    data: result,
  };
};

const getChapterById = async (id: string, userId?: string) => {
  const [result, premiumEnabled] = await Promise.all([
    prisma.chapter.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        series: {
          select: { title: true, slug: true },
        },
      },
    }),
    isPremiumChaptersEnabled(),
  ]);
  
  if (!result) return null;

  const effectivelyLocked = premiumEnabled ? result.isLocked : false;

  // Check if the authenticated user already purchased this chapter
  let isPurchased = !effectivelyLocked;
  if (userId && effectivelyLocked) {
    const purchase = await prisma.chapterPurchase.findUnique({
      where: { userId_chapterId: { userId, chapterId: id } },
    });
    isPurchased = !!purchase;
  }

  // Find prev and next chapters
  const prevChapter = await prisma.chapter.findFirst({
    where: {
      seriesId: result.seriesId,
      number: { lt: result.number },
    },
    orderBy: { number: 'desc' },
  });

  const nextChapter = await prisma.chapter.findFirst({
    where: {
      seriesId: result.seriesId,
      number: { gt: result.number },
    },
    orderBy: { number: 'asc' },
  });

  return {
    ...result,
    isLocked: effectivelyLocked,
    coinCost: effectivelyLocked ? result.coinCost : 0,
    images: (effectivelyLocked && !isPurchased) ? [] : result.images,
    isPurchased: !effectivelyLocked || isPurchased,
    prevChapterNumber: prevChapter?.number || null,
    nextChapterNumber: nextChapter?.number || null,
  };
};

const createChapter = async (data: any, userId?: string, role?: string) => {
  const { images = [], ...chapterData } = data;

  if (role === 'creator') {
    const series = await prisma.series.findUnique({
      where: { id: chapterData.seriesId },
      include: { creator: { select: { userId: true } } },
    });
    if (!series || (series.creator?.userId !== userId && series.creatorId !== userId)) {
      throw new AppError(httpStatus.FORBIDDEN, 'You can only add chapters to your own series');
    }
  }

  const result = await prisma.chapter.create({
    data: {
      ...chapterData,
      images: {
        create: (images || []).map((img: { url: string; order: number }) => ({
          url: img.url,
          order: img.order,
        })),
      },
    },
  });

  cacheService.delByPattern('cache:chapter:*').catch(() => null);
  cacheService.delByPattern('cache:series:*').catch(() => null);

  return result;
};

const updateChapter = async (id: string, data: any, userId?: string, role?: string) => {
  const { images, ...chapterData } = data;

  const existing = await prisma.chapter.findUnique({
    where: { id },
    include: {
      series: {
        include: {
          creator: { select: { userId: true } },
        },
      },
      images: true,
    },
  });
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Chapter not found');
  }

  if (role === 'creator' && existing.series.creator?.userId !== userId && existing.series.creatorId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only edit chapters of your own series');
  }

  // Delete replaced or removed images from Cloudinary
  if (images && Array.isArray(images)) {
    const newUrls = new Set(images.map((img: any) => img.url));
    const oldImagesToDelete = existing.images.filter((img) => !newUrls.has(img.url));
    for (const oldImg of oldImagesToDelete) {
      deleteFromCloudinary(oldImg.url).catch(() => null);
    }
  }

  const result = await prisma.chapter.update({
    where: { id },
    data: {
      ...chapterData,
      ...(images && {
        images: {
          deleteMany: {},
          create: images.map((img: { url: string; order: number }) => ({
            url: img.url,
            order: img.order,
          })),
        },
      }),
    },
  });

  cacheService.delByPattern('cache:chapter:*').catch(() => null);
  cacheService.delByPattern('cache:series:*').catch(() => null);

  return result;
};

const deleteChapter = async (id: string, userId?: string, role?: string) => {
  const existing = await prisma.chapter.findUnique({
    where: { id },
    include: {
      series: {
        include: {
          creator: { select: { userId: true } },
        },
      },
      images: true,
    },
  });
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Chapter not found');
  }

  if (role === 'creator' && existing.series.creator?.userId !== userId && existing.series.creatorId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only delete chapters of your own series');
  }

  // Delete all chapter images from Cloudinary
  if (existing.images && existing.images.length > 0) {
    for (const img of existing.images) {
      deleteFromCloudinary(img.url).catch(() => null);
    }
  }

  const deleted = await prisma.chapter.delete({
    where: { id },
  });

  cacheService.delByPattern('cache:chapter:*').catch(() => null);
  cacheService.delByPattern('cache:series:*').catch(() => null);

  return deleted;
};

const extractWebpageImages = async (pageUrl: string) => {
  if (!pageUrl || (!pageUrl.startsWith('http://') && !pageUrl.startsWith('https://'))) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Please provide a valid web URL (e.g., https://example.com/chapter-1)');
  }

  try {
    const parsedUrl = new URL(pageUrl);
    const response = await axios.get(pageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': parsedUrl.origin,
      },
      timeout: 20000,
    });

    const html = response.data;
    if (typeof html !== 'string') {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid response received from the specified URL.');
    }

    const $ = cheerio.load(html);
    const extractedSet = new Set<string>();

    const pageTitle = $('title').first().text().trim() || $('h1').first().text().trim() || '';

    // Check high priority comic reader containers first
    const readerSelectors = [
      '.reading-content img',
      '.reader-area img',
      '#chapter-images img',
      '.chapter-image img',
      '.container-chapter-reader img',
      '.page-break img',
      '.entry-content img',
      '.entry-content-single img',
      '.chapter-content img',
      '#readerarea img',
      '.comic-page img',
      '.pages-container img',
      'article img',
      'main img',
      'img',
    ];

    let foundElements: any = null;
    for (const selector of readerSelectors) {
      const el = $(selector);
      if (el.length > 2) {
        foundElements = el;
        break;
      }
    }

    if (!foundElements || foundElements.length === 0) {
      foundElements = $('img');
    }

    foundElements.each((_: any, el: any) => {
      const elem = $(el);
      const possibleSrc =
        elem.attr('data-src') ||
        elem.attr('data-lazy-src') ||
        elem.attr('data-original') ||
        elem.attr('data-url') ||
        elem.attr('data-srcset')?.split(' ')[0] ||
        elem.attr('src');

      if (possibleSrc) {
        const trimmed = possibleSrc.trim();
        if (
          trimmed.startsWith('data:image/svg') ||
          trimmed.includes('gravatar.com') ||
          trimmed.includes('avatar') ||
          trimmed.includes('favicon') ||
          trimmed.includes('logo') ||
          trimmed.includes('badge') ||
          trimmed.includes('pixel') ||
          trimmed.includes('banner-ad')
        ) {
          return;
        }

        try {
          const absoluteUrl = new URL(trimmed, pageUrl).href;
          extractedSet.add(absoluteUrl);
        } catch {
          // Ignore invalid URLs
        }
      }
    });

    const images = Array.from(extractedSet);

    if (images.length === 0) {
      throw new AppError(httpStatus.NOT_FOUND, 'No readable comic images found on the provided webpage.');
    }

    // Natural numerical sort on image filenames/URLs
    images.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    return {
      title: pageTitle,
      count: images.length,
      images,
    };
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error?.response?.statusText || error?.message || 'Failed to fetch and scrape the webpage.'
    );
  }
};

export const ChapterService = {
  getChapterById,
  getChapterByNumber,
  getAllChapters,
  createChapter,
  updateChapter,
  deleteChapter,
  extractWebpageImages,
};
