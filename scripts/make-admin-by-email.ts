// scripts/make-admin-by-email.ts
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function makeAdmin() {
  const { db } = await import('@/lib/db');
  const { Resend } = await import('resend');
  const { AdminWelcomeEmail } = await import(
    '../app/_components/emails/AdminWelcomeEmail'
  );

  const email = process.argv[2];

  if (!email) {
    console.error('Usage: npm run make-admin -- someone@example.com');
    process.exit(1);
  }

  const user = await db.collection('user').findOne({ email });

  if (!user) {
    console.log(`❌ No user found with email: ${email}`);
    console.log('   They need to register an account first.');
    process.exit(1);
  }

  if (user.role === 'admin') {
    console.log(`ℹ️  ${email} is already an admin.`);
    process.exit(0);
  }

  await db.collection('user').updateOne(
    { _id: user._id },
    {
      $set: {
        role: 'admin',
        onboardingComplete: true,
        tempPassword: false, // they already set their own password at signup
      },
    },
  );

  console.log('✅ Promoted to admin');
  console.log('   Email:', email);

  // Notify immediately — don't wait for the yearly cron
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'A.R.W.P.C <admin@send.exams1.name.ng>',
      to: email,
      subject: "You've been made an admin",
      react: AdminWelcomeEmail({
        name: user.fullName || user.name || 'there',
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/login`,
      }),
    });

    await db.collection('user').updateOne(
      { _id: user._id },
      { $set: { adminNotifiedAt: new Date() } },
    );

    console.log('   Welcome email: sent');
  } catch (err) {
    // Promotion already succeeded — don't fail the whole script over email delivery.
    // The yearly cron will pick this admin up as a fallback since adminNotifiedAt
    // never got set.
    console.error('   ⚠️  Failed to send welcome email:', err);
  }

  console.log('   Login → /admin/login');
  process.exit(0);
}

makeAdmin().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});