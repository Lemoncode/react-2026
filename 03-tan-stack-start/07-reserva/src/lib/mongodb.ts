import { MongoClient, type Db } from "mongodb";

const DB_NAME = "calendar-availability";

// Cache the client on globalThis so Vite HMR doesn't leak connections in dev.
const globalForMongo = globalThis as unknown as {
  __mongoClientPromise?: Promise<MongoClient>;
};

const getClientPromise = (): Promise<MongoClient> => {
  if (globalForMongo.__mongoClientPromise) {
    return globalForMongo.__mongoClientPromise;
  }
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGO_URI in environment");
  globalForMongo.__mongoClientPromise = new MongoClient(uri).connect();
  return globalForMongo.__mongoClientPromise;
};

export const getDb = async (): Promise<Db> => {
  const client = await getClientPromise();
  return client.db(DB_NAME);
};
