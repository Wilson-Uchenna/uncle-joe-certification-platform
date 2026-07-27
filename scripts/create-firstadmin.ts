// scripts/make-first-user-admin.ts
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI not found in .env.local');
}

async function makeFirstUserAdmin() {
  await mongoose.connect(MONGODB_URI!);
  
  const db = mongoose.connection.db;
  
  if (!db) {
    await mongoose.disconnect();
    throw new Error('Failed to get MongoDB database object after connecting');
  }
  
  const firstUser = await db.collection('user')
    .find()
    .sort({ createdAt: 1 })
    .limit(1)
    .next();
  
  if (!firstUser) {
    console.log('❌ No users found. Register a user first.');
    await mongoose.disconnect();
    process.exit(1);
  }
  
  await db.collection('user').updateOne(
    { _id: firstUser._id },
    { 
      $set: { 
        role: 'admin',
        onboardingComplete: true  // ← Skip onboarding
      } 
    }
  );
  
  console.log('✅ First user promoted to admin');
  console.log('   Email:', firstUser.email);
  console.log('   Onboarding: skipped');
  console.log('   Login → /admin/dashboard');
  
  await mongoose.disconnect();
}

makeFirstUserAdmin().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});