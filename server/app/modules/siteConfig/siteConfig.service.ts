import { prisma } from '../../../lib/prisma';
import { cacheService } from '../../utils/redis';

const getConfig = async () => {
  let config = await prisma.siteConfig.findUnique({
    where: { id: 'global' },
  });

  if (!config) {
    config = await prisma.siteConfig.create({
      data: {
        id: 'global',
        appName: 'Comic BD',
        appTagline: 'Read Trending Webtoons, Manga & Comics',
        heroHeadline: 'Discover Unlimited Stories & Comics',
        heroSubtitle: 'Read high quality manhwa, manga and manhua translated with lightning speed.',
        announceText: 'Welcome to Comic BD! Enjoy our latest manhwa and manga collection.',
        announceLink: '/series',
        socialLinks: {
          facebook: '',
          twitter: 'https://twitter.com',
          discord: 'https://discord.gg',
          instagram: '',
          youtube: '',
          telegram: '',
          reddit: '',
        },
      },
    });
  }

  // Flatten the config object for the frontend
  const links = (config.socialLinks as any) || {};
  return {
    ...config,
    facebook: links.facebook || '',
    twitter: links.twitter || '',
    discord: links.discord || '',
    instagram: links.instagram || '',
    youtube: links.youtube || '',
    telegram: links.telegram || '',
    reddit: links.reddit || '',
  };
};

const updateConfig = async (data: any) => {
  const { facebook, twitter, discord, instagram, youtube, telegram, reddit, ...rest } = data;

  const socialLinks = {
    facebook: facebook || '',
    twitter: twitter || '',
    discord: discord || '',
    instagram: instagram || '',
    youtube: youtube || '',
    telegram: telegram || '',
    reddit: reddit || '',
  };

  const configData = {
    ...rest,
    socialLinks,
  };

  // Convert numeric types safely
  if (configData.pointToFiatRate !== undefined) configData.pointToFiatRate = Number(configData.pointToFiatRate);
  if (configData.maxDailyAdPoints !== undefined) configData.maxDailyAdPoints = Number(configData.maxDailyAdPoints);
  if (configData.featuredRequestFee !== undefined) configData.featuredRequestFee = Number(configData.featuredRequestFee);
  if (configData.referralBonusPercent !== undefined) configData.referralBonusPercent = Number(configData.referralBonusPercent);
  if (configData.referralActiveMonths !== undefined) configData.referralActiveMonths = Number(configData.referralActiveMonths);
  if (configData.referralSignupBonus !== undefined) configData.referralSignupBonus = Number(configData.referralSignupBonus);
  if (configData.minWithdrawalPoints !== undefined) configData.minWithdrawalPoints = Number(configData.minWithdrawalPoints);
  if (configData.creatorRevenueSharePercent !== undefined) configData.creatorRevenueSharePercent = Number(configData.creatorRevenueSharePercent);

  // Convert boolean types safely
  if (configData.isMaintenanceMode !== undefined) configData.isMaintenanceMode = Boolean(configData.isMaintenanceMode);
  if (configData.allowNewRegistrations !== undefined) configData.allowNewRegistrations = Boolean(configData.allowNewRegistrations);
  if (configData.allowCreatorApplications !== undefined) configData.allowCreatorApplications = Boolean(configData.allowCreatorApplications);
  if (configData.enableGlobalChat !== undefined) configData.enableGlobalChat = Boolean(configData.enableGlobalChat);
  if (configData.enableStripePayment !== undefined) configData.enableStripePayment = Boolean(configData.enableStripePayment);
  if (configData.enableCashOut !== undefined) configData.enableCashOut = Boolean(configData.enableCashOut);

  const updated = await prisma.siteConfig.upsert({
    where: { id: 'global' },
    update: configData,
    create: {
      id: 'global',
      ...configData,
    },
  });

  cacheService.delByPattern('cache:*site-config*').catch(() => null);

  // Return flattened
  return {
    ...updated,
    facebook: socialLinks.facebook,
    twitter: socialLinks.twitter,
    discord: socialLinks.discord,
    instagram: socialLinks.instagram,
    youtube: socialLinks.youtube,
    telegram: socialLinks.telegram,
    reddit: socialLinks.reddit,
  };
};

const submitContactMessage = async (data: {
  name: string;
  email: string;
  subject?: string;
  category?: string;
  message: string;
}) => {
  return await prisma.contactMessage.create({
    data: {
      name: data.name.trim(),
      email: data.email.trim(),
      subject: data.subject?.trim() || null,
      category: data.category?.trim() || 'General',
      message: data.message.trim(),
    },
  });
};

const getContactMessages = async () => {
  return await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
};

const markContactMessageRead = async (id: string) => {
  return await prisma.contactMessage.update({
    where: { id },
    data: { isRead: true },
  });
};

export const SiteConfigService = {
  getConfig,
  updateConfig,
  submitContactMessage,
  getContactMessages,
  markContactMessageRead,
};
