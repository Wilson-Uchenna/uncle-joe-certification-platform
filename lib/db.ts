import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not defined in .env.local");
}

let db: Db;

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoDb?: Db;
  };

  if (!globalWithMongo._mongoDb) {
    const client = new MongoClient(uri);
    globalWithMongo._mongoDb = client.db("uncle-joe-certification");
  }
  db = globalWithMongo._mongoDb;
} else {
  const client = new MongoClient(uri);
  db = client.db("uncle-joe-certification");
}

export { db };