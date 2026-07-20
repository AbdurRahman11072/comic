"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteConfigService = void 0;
const prisma_1 = require("../../../lib/prisma");
const getConfig = async () => {
    let config = await prisma_1.prisma.siteConfig.findUnique({
        where: { id: 'global' },
    });
    if (!config) {
        config = await prisma_1.prisma.siteConfig.create({
            data: {
                id: 'global',
                announceText: 'Welcome to Genz Toon! Enjoy our latest manhwa and manga collection.',
                announceLink: '/series',
                socialLinks: {
                    facebook: '',
                    twitter: 'https://twitter.com',
                    discord: 'https://discord.gg',
                    instagram: '',
                    youtube: '',
                },
            },
        });
    }
    // Flatten the config object for the frontend
    const links = config.socialLinks || {};
    return {
        ...config,
        facebook: links.facebook || '',
        twitter: links.twitter || '',
        discord: links.discord || '',
        instagram: links.instagram || '',
        youtube: links.youtube || '',
    };
};
const updateConfig = async (data) => {
    const { facebook, twitter, discord, instagram, youtube, ...rest } = data;
    const socialLinks = {
        facebook: facebook || '',
        twitter: twitter || '',
        discord: discord || '',
        instagram: instagram || '',
        youtube: youtube || '',
    };
    const configData = {
        ...rest,
        socialLinks,
    };
    // Convert types if they are sent as strings
    if (configData.pointToFiatRate !== undefined)
        configData.pointToFiatRate = Number(configData.pointToFiatRate);
    if (configData.maxDailyAdPoints !== undefined)
        configData.maxDailyAdPoints = Number(configData.maxDailyAdPoints);
    if (configData.featuredRequestFee !== undefined)
        configData.featuredRequestFee = Number(configData.featuredRequestFee);
    if (configData.referralBonusPercent !== undefined)
        configData.referralBonusPercent = Number(configData.referralBonusPercent);
    if (configData.referralActiveMonths !== undefined)
        configData.referralActiveMonths = Number(configData.referralActiveMonths);
    const updated = await prisma_1.prisma.siteConfig.upsert({
        where: { id: 'global' },
        update: configData,
        create: {
            id: 'global',
            ...configData,
        },
    });
    // Return flattened
    return {
        ...updated,
        facebook: socialLinks.facebook,
        twitter: socialLinks.twitter,
        discord: socialLinks.discord,
        instagram: socialLinks.instagram,
        youtube: socialLinks.youtube,
    };
};
exports.SiteConfigService = {
    getConfig,
    updateConfig,
};
