import { prisma } from '../../../lib/prisma';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';

const defaultAchievements = [
  {
    id: "ach-ad-first",
    title: "Ad First Timer",
    description: "Earn points by watching your first ad pack.",
    badgeIcon: "Zap",
    pointsReward: 10,
  },
  {
    id: "ach-ad-expert",
    title: "Ad Expert",
    description: "Complete 10 ad packs to support the creators.",
    badgeIcon: "Flame",
    pointsReward: 50,
  },
  {
    id: "ach-chapter-explorer",
    title: "Chapter Explorer",
    description: "Unlock your first locked premium chapter.",
    badgeIcon: "BookOpen",
    pointsReward: 15,
  },
  {
    id: "ach-platform-collector",
    title: "Platform Collector",
    description: "Unlock 5 premium chapters using your coins.",
    badgeIcon: "Trophy",
    pointsReward: 100,
  },
  {
    id: "ach-wealthy-reader",
    title: "Wealthy Reader",
    description: "Reach a point balance of 100 points.",
    badgeIcon: "Gem",
    pointsReward: 30,
  }
];

const seedDefaultAchievements = async () => {
  for (const ach of defaultAchievements) {
    await prisma.achievement.upsert({
      where: { id: ach.id },
      update: {
        title: ach.title,
        description: ach.description,
        badgeIcon: ach.badgeIcon,
        pointsReward: ach.pointsReward
      },
      create: ach,
    });
  }
};

const getAchievements = async (userId: string) => {
  // Ensure default achievements exist
  await seedDefaultAchievements();

  // Fetch all achievements
  const allAchievements = await prisma.achievement.findMany({
    orderBy: { createdAt: 'asc' }
  });

  // Fetch user's unlocked achievements
  const userUnlocked = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true, unlockedAt: true }
  });

  const unlockedIds = new Set(userUnlocked.map(ua => ua.achievementId));

  return allAchievements.map(ach => ({
    ...ach,
    isUnlocked: unlockedIds.has(ach.id),
    unlockedAt: userUnlocked.find(ua => ua.achievementId === ach.id)?.unlockedAt || null
  }));
};

const checkAndUnlockAchievements = async (userId: string) => {
  // Ensure default achievements exist in DB
  await seedDefaultAchievements();

  // 1. Fetch user unlocked IDs
  const unlocked = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true }
  });
  const unlockedIds = new Set(unlocked.map(u => u.achievementId));

  // 2. Fetch stats
  const [adCount, buyCount, user] = await Promise.all([
    prisma.pointTransaction.count({
      where: { userId, type: 'EARN_AD' }
    }),
    prisma.chapterPurchase.count({
      where: { userId }
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { points: true }
    })
  ]);

  const newlyUnlocked: string[] = [];

  // Check Helper
  const tryUnlock = async (achievementId: string, condition: boolean) => {
    if (condition && !unlockedIds.has(achievementId)) {
      const ach = await prisma.achievement.findUnique({ where: { id: achievementId } });
      if (ach) {
        // Unlock
        await prisma.$transaction([
          prisma.userAchievement.create({
            data: { userId, achievementId }
          }),
          prisma.user.update({
            where: { id: userId },
            data: { points: { increment: ach.pointsReward } }
          }),
          prisma.pointTransaction.create({
            data: {
              userId,
              type: 'REFERRAL_BONUS', // fallback to referral_bonus or custom category
              amount: ach.pointsReward,
              description: `Unlocked Achievement: ${ach.title} (+${ach.pointsReward} points)`
            }
          })
        ]);
        newlyUnlocked.push(ach.title);
      }
    }
  };

  // Run Checks
  await tryUnlock('ach-ad-first', adCount >= 1);
  await tryUnlock('ach-ad-expert', adCount >= 10);
  await tryUnlock('ach-chapter-explorer', buyCount >= 1);
  await tryUnlock('ach-platform-collector', buyCount >= 5);
  if (user) {
    await tryUnlock('ach-wealthy-reader', user.points >= 100);
  }

  return newlyUnlocked;
};

export const AchievementService = {
  getAchievements,
  checkAndUnlockAchievements,
  seedDefaultAchievements
};
