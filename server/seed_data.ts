import { prisma } from './lib/prisma';
import 'dotenv/config';

// ─── ADMIN CREDENTIALS ────────────────────────────────────────────────────────
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Admin123@';
const ADMIN_NAME = 'Admin';

// ─── SERIES SAMPLES ───────────────────────────────────────────────────────────
const SERIES_SAMPLES = [
  {
    title: "The Sword Emperor Reincarnated",
    description: "The House of Cardenas, the legendary swordsmen sworn to protect the Arcadia Empire, is renowned as a formidable military powerhouse.",
    type: "MANHWA" as const,
    status: "ONGOING" as const,
    coverUrl: "https://wsrv.nl/?url=https%3A%2F%2Fstorage.vortexscans.org%2Fupload%2Fseries%2Ffeatured%2F751%2F32f834a2-2c1c-4358-b13a-555b87890bd9.png&w=640&q=90",
    bgUrl: "https://wsrv.nl/?url=https%3A%2F%2Fstorage.vortexscans.org%2Fupload%2Fseries%2Ffeatured%2F751%2F32f834a2-2c1c-4358-b13a-555b87890bd9.png&w=1920&q=70",
    genres: ["Action", "Fantasy", "Martial Arts"],
    isPinned: true
  },
  {
    title: "Solo Leveling: Ragnarok",
    description: "The successor to the world-renowned Solo Leveling. Sung Su-ho's journey begins now.",
    type: "MANHWA" as const,
    status: "ONGOING" as const,
    coverUrl: "https://wsrv.nl/?url=cdn.meowing.org/uploads/WmGZLGSLSPd&w=640",
    bgUrl: "https://wsrv.nl/?url=cdn.meowing.org/uploads/WmGZLGSLSPd&w=1920",
    genres: ["Action", "Adventure", "Fantasy"],
    isPinned: true
  },
  {
    title: "The Return of the Ranker",
    description: "I was the strongest. Then I was betrayed. Now I am back for revenge.",
    type: "MANHWA" as const,
    status: "ONGOING" as const,
    coverUrl: "https://wsrv.nl/?url=cdn.meowing.org/uploads/4Ku3Rzm_1MJ&w=640",
    bgUrl: "https://wsrv.nl/?url=cdn.meowing.org/uploads/4Ku3Rzm_1MJ&w=1920",
    genres: ["Action", "Fantasy"],
    isPinned: false
  },
  {
    title: "Married Man in Another World",
    description: "What happens when a normal man gets married in a world of magic?",
    type: "MANHWA" as const,
    status: "ONGOING" as const,
    coverUrl: "https://wsrv.nl/?url=cdn.meowing.org/uploads/F7TQ0vd9Fj2&w=640",
    bgUrl: "https://wsrv.nl/?url=cdn.meowing.org/uploads/F7TQ0vd9Fj2&w=1920",
    genres: ["Comedy", "Romance", "Fantasy"],
    isPinned: false
  }
];

// ─── CREATE ADMIN VIA BACKEND API ─────────────────────────────────────────────
async function seedAdmin() {
  console.log('\n👤 Seeding admin user...');

  // Check if admin already exists
  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    // Ensure role is admin
    if (existing.role !== 'admin') {
      await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { role: 'admin' },
      });
      console.log(`✅ Updated existing user "${ADMIN_EMAIL}" role → admin`);
    } else {
      console.log(`ℹ️  Admin user "${ADMIN_EMAIL}" already exists with admin role.`);
    }
    
    // Check if account credential exists
    const existingAccount = await prisma.account.findFirst({
      where: { userId: existing.id, providerId: 'credential' }
    });
    if (existingAccount && existingAccount.password) {
      console.log(`ℹ️  Updating existing password credentials for "${ADMIN_EMAIL}"...`);
    }
    console.log(`ℹ️  Missing password credentials for "${ADMIN_EMAIL}". Setting them...`);
  }

  // Try via backend API (backend must be running)
  const backendUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BACKEND_URL || process.env.BETTER_AUTH_URL || 'http://localhost:5000';

  try {
    const res = await fetch(`${backendUrl}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    const responseText = await res.text();
    let data: any = {};
    try { data = JSON.parse(responseText); } catch {}

    if (res.ok) {
      // Promote to admin & verify email
      await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { role: 'admin', emailVerified: true },
      });
      console.log(`✅ Admin user created via API: ${ADMIN_EMAIL} (role: admin)`);
      return;
    }

    // If blocked by IP restriction or other non-fatal error, fall through to direct insert
    console.warn(`⚠️  API signup returned ${res.status}: ${data?.message || responseText}. Trying direct DB insert...`);
  } catch (err) {
    console.warn(`⚠️  Could not reach backend API (is it running?). Falling back to direct DB insert...`);
  }

  // Fallback: create user record directly, then create account with hashed password
  let hashedPassword: string | null = null;
  try {
    const { hashPassword } = await import('better-auth/crypto');
    hashedPassword = await hashPassword(ADMIN_PASSWORD);
    console.log('🔒 Password hashed with better-auth/crypto');
  } catch (err) {
    console.error('❌ Failed to hash password with better-auth/crypto:', err);
  }

  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: 'admin', name: ADMIN_NAME, emailVerified: true },
    create: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: 'admin',
      emailVerified: true,
    },
  });

  if (hashedPassword) {
    // Create credential account record (this is how better-auth stores email/password credentials)
    await prisma.account.upsert({
      where: { id: `seed-${user.id}` },
      update: { password: hashedPassword },
      create: {
        id: `seed-${user.id}`,
        accountId: user.id,
        providerId: 'credential',
        userId: user.id,
        password: hashedPassword,
      },
    });
    console.log(`✅ Admin user created directly in DB: ${ADMIN_EMAIL} (role: admin)`);
  } else {
    console.log(`⚠️  User record created but no password set. Please register via UI first.`);
  }
}

// ─── SEED SERIES ──────────────────────────────────────────────────────────────
async function seedSeries() {
  console.log('\n📚 Seeding series data...');

  for (const s of SERIES_SAMPLES) {
    const { genres, ...seriesData } = s;

    const slug = seriesData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const series = await prisma.series.upsert({
      where: { slug },
      update: {},
      create: {
        ...seriesData,
        slug,
        genres: {
          connectOrCreate: genres.map((name) => ({
            where: { name },
            create: { name }
          }))
        }
      }
    });

    console.log(`  ✅ Series: ${series.title}`);

    for (let i = 1; i <= 5; i++) {
      await prisma.chapter.upsert({
        where: { seriesId_number: { seriesId: series.id, number: i } },
        update: {},
        create: {
          seriesId: series.id,
          number: i,
          title: `Chapter ${i}`,
          isLocked: i > 3,
          coinCost: i > 3 ? 3 : 0,
        }
      });
    }
  }

  console.log('📚 Series seeding completed!');
}

async function seedAds() {
  console.log('\n📢 Seeding default AdSense placements...');
  const placements = [
    { title: 'Home Top Banner AdSense', placement: 'home_top', adSlotId: '1234567890' },
    { title: 'Home Bottom Banner AdSense', placement: 'home_bottom', adSlotId: '0987654321' },
    { title: 'Reader Bottom Banner AdSense', placement: 'reader_bottom', adSlotId: '1122334455' },
    { title: 'Browse Banner AdSense', placement: 'browse_banner', adSlotId: '5566778899' },
  ];

  for (const p of placements) {
    const existing = await prisma.customAd.findFirst({
      where: { placement: p.placement, provider: 'ADSENSE' },
    });

    if (!existing) {
      await prisma.customAd.create({
        data: {
          title: p.title,
          provider: 'ADSENSE',
          format: 'BANNER',
          placement: p.placement,
          adClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-8848458851675460',
          adSlotId: p.adSlotId,
          isActive: true,
          status: 'ACTIVE',
        },
      });
      console.log(`  ✅ Ad created: ${p.placement}`);
    } else {
      console.log(`  ℹ️ Ad already exists: ${p.placement}`);
    }
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Starting seed...\n');

  await seedAdmin();
  await seedSeries();
  await seedAds();

  console.log('\n✨ Seed completed successfully!');
  console.log(`\n🔑 Admin credentials:`);
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
