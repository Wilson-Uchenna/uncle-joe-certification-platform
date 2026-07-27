import mongoose from 'mongoose';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI not found');
}

async function deleteUser(email: string) {
  await mongoose.connect(MONGODB_URI!);
  
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Mongoose connection db is not available');
  }
  
  const result = await db.collection('user').deleteOne({ email });
  
  if (result.deletedCount === 0) {
    console.log('❌ User not found:', email);
  } else {
    console.log('✅ Deleted:', email);
  }
  
  await mongoose.disconnect();
}

const email = process.argv[2] || 'admin@unclejoe.com';
deleteUser(email);