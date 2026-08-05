// scripts/seed-admin.ts
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function seedAdmin() {
  const { auth } = await import('@/lib/auth');
  const { db } = await import('@/lib/db');
  const { Resend } = await import('resend');
  const { AdminWelcomeEmail } = await import(
    '../app/_components/emails/AdminWelcomeEmail'
  );

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

  // Notify immediately — don't wait for the yearly cron
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'A.R.W.P.C <admin@send.exams1.name.ng>',
      to: adminEmail,
      subject: "You've been made an admin",
      react: AdminWelcomeEmail({
        name: adminName,
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/login`,
      }),
    });

    await db.collection('user').updateOne(
      { email: adminEmail },
      { $set: { adminNotifiedAt: new Date() } },
    );

    console.log('   Welcome email: sent');
  } catch (err) {
    console.error('   ⚠️  Failed to send welcome email:', err);
  }

  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});