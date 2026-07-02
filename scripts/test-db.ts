import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); 
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

const LOCAL_URI = 'mongodb://localhost:27017/uncle-joe';
const ATLAS_URI = process.env.MONGODB_URI; // Your Atlas connection string

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

async function testLocalDB() {
  console.log('\n=== Testing Local MongoDB ===\n');
  
  try {
    // Test 1: Native driver connection
    const client = new MongoClient(LOCAL_URI);
    await client.connect();
    console.log('✅ Native driver connected to localhost');
    
    // Test 2: List databases
    const admin = client.db('admin');
    const result = await admin.command({ ping: 1 });
    console.log('✅ Ping successful:', result);
    
    // Test 3: Create test collection
    const db = client.db('uncle-joe-test');
    await db.collection('test').insertOne({ message: 'Hello from local!', time: new Date() });
    console.log('✅ Inserted document to local DB');
    
    // Test 4: Read it back
    const doc = await db.collection('test').findOne({ message: 'Hello from local!' });
    console.log('✅ Read back:', doc);
    
    // Cleanup
    await db.dropCollection('test');
    console.log('✅ Cleaned up test collection');
    
    await client.close();
    console.log('✅ Local MongoDB: ALL TESTS PASSED\n');
    
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('❌ Local MongoDB failed:', message);
    if (message.includes('ECONNREFUSED')) {
      console.log('\n💡 Fix: Start MongoDB with:');
      console.log('   macOS: brew services start mongodb-community');
      console.log('   Linux: sudo systemctl start mongodb');
    }
  }
}

async function testAtlasDB() {
  console.log('\n=== Testing MongoDB Atlas ===\n');
  
  if (!ATLAS_URI) {
    console.log('⚠️  No MONGODB_URI found in environment');
    console.log('   Set it in .env.local or export it:');
    console.log('   export MONGODB_URI="mongodb+srv://user:pass@cluster..."');
    return;
  }
  
  try {
    // Test 1: Native driver connection
    const client = new MongoClient(ATLAS_URI);
    await client.connect();
    console.log('✅ Connected to Atlas');
    
    // Test 2: Ping
    const result = await client.db('admin').command({ ping: 1 });
    console.log('✅ Atlas ping successful');
    
    // Test 3: Create test document
    const db = client.db('uncle-joe-test');
    await db.collection('test').insertOne({ message: 'Hello from Atlas!', time: new Date() });
    console.log('✅ Inserted document to Atlas');
    
    // Test 4: Read back
    const doc = await db.collection('test').findOne({ message: 'Hello from Atlas!' });
    console.log('✅ Read back:', doc);
    
    // Cleanup
    await db.dropCollection('test');
    console.log('✅ Cleaned up');
    
    await client.close();
    console.log('✅ Atlas: ALL TESTS PASSED\n');
    
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('❌ Atlas failed:', message);
    if (message.includes('IP')) {
      console.log('\n💡 Fix: Add your IP to Atlas Network Access:');
      console.log('   https://cloud.mongodb.com → Network Access → Add IP Address');
    }
    if (message.includes('authentication')) {
      console.log('\n💡 Fix: Check your username/password in the connection string');
    }
  }
}

async function testMongoose() {
  console.log('\n=== Testing Mongoose (Local) ===\n');
  
  try {
    await mongoose.connect(LOCAL_URI);
    console.log('✅ Mongoose connected');
    
    // Define temp model
    const TestSchema = new mongoose.Schema({ name: String, time: Date });
    const Test = mongoose.models.Test || mongoose.model('Test', TestSchema);
    
    // Create
    const doc = await Test.create({ name: 'Mongoose test', time: new Date() });
    console.log('✅ Created:', doc._id);
    
    // Read
    const found = await Test.findById(doc._id);
    console.log('✅ Found:', found?.name);
    
    // Cleanup
    await Test.deleteOne({ _id: doc._id });
    console.log('✅ Deleted');
    
    await mongoose.disconnect();
    console.log('✅ Mongoose: ALL TESTS PASSED\n');
    
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('❌ Mongoose failed:', message);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Database Tests...\n');
  
  await testLocalDB();
  await testAtlasDB();
  await testMongoose();
  
  console.log('🏁 All tests complete');
  process.exit(0);
}

runTests();