import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function seedAdmin() {
  // dynamic import — runs AFTER config() above, unlike a static import
  const { auth } = await import('@/lib/auth');
  const { db } = await import('@/lib/db');

  const adminEmail = process.env.ADMIN_EMAIL!;
  const adminPassword = process.env.ADMIN_PASSWORD!;
  const adminName = process.env.ADMIN_NAME || 'Admin';

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set (as env vars, or in .env.local)');
  }

  const existing = await db.collection('user').findOne({ email: adminEmail });

  if (existing) {
    console.log('❌ Admin already exists, skipping seed.');
    process.exit(1);
  }

  const result = await auth.api.createUser({
    body: {
      email: adminEmail,
      password: adminPassword,
      name: adminName,
      role: 'admin',
      data: {
        tempPassword: true,
      },
    },
  });

  console.log('✅ Admin created:', result.user.email);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});