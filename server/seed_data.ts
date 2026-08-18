import { prisma } from './lib/prisma';
import 'dotenv/config';

// ─── ADMIN CREDENTIALS ────────────────────────────────────────────────────────
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@gmail.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin123@';
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'Admin';

// ─── CREATE ADMIN USER ────────────────────────────────────────────────────────
async function seedAdmin() {
  console.log('\n👤 Seeding admin user...');

  // Check if admin already exists
  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    if (existing.role !== 'admin') {
      await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { role: 'admin', emailVerified: true },
      });
      console.log(`✅ Updated existing user "${ADMIN_EMAIL}" role → admin`);
    } else {
      console.log(`ℹ️  Admin user "${ADMIN_EMAIL}" already exists with admin role.`);
    }
  }

  // Try via backend API (backend must be running)
  const backendUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BACKEND_URL ||
    process.env.BETTER_AUTH_URL ||
    'http://localhost:5000';

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
    try {
      data = JSON.parse(responseText);
    } catch {}

    if (res.ok) {
      // Promote to admin & verify email
      await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { role: 'admin', emailVerified: true },
      });
      console.log(`✅ Admin user created via API: ${ADMIN_EMAIL} (role: admin)`);
      return;
    }

    console.warn(
      `⚠️  API signup returned ${res.status}: ${data?.message || responseText}. Trying direct DB insert...`
    );
  } catch (err) {
    console.warn(`⚠️  Could not reach backend API. Falling back to direct DB insert...`);
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

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Starting seed...\n');

  await seedAdmin();

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
