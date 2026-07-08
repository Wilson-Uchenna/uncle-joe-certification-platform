import mongoose from 'mongoose';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const db = mongoose.connection.db;
  
  if (!db) {
    throw new Error('Database connection failed');
  }
  
  const users = await db.collection('users').find().toArray();
  console.log('Users found:', users.length);
  
  users.forEach((u: any) => {
    console.log('---');
    console.log('Email:', u.email);
    console.log('Role:', u.role);
    console.log('Has password:', !!u.password);
    console.log('Keys:', Object.keys(u));
  });
  
  await mongoose.disconnect();
}

check().catch(console.error);