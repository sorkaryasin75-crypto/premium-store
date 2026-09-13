import { MongoClient, Db, ClientSession, TransactionOptions } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDB(): Promise<{ client: MongoClient; db: Db }> {
  if (client && db) {
    return { client, db };
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not defined.');
  }

  client = new MongoClient(mongoUri, {
    maxPoolSize: 20,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
  });

  await client.connect();
  db = client.db();

  console.log('✅ Connected successfully to MongoDB ReplicaSet Engine');
  return { client, db };
}

export function getDB(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
}

export function getClient(): MongoClient {
  if (!client) {
    throw new Error('MongoClient not initialized. Call connectDB() first.');
  }
  return client;
}

// Transaction Helper supporting MongoDB ACID Operations
export async function withTransaction<T>(
  fn: (session: ClientSession) => Promise<T>,
  options?: TransactionOptions
): Promise<T> {
  const currentClient = getClient();
  const session = currentClient.startSession();

  try {
    let result: T;
    await session.withTransaction(async () => {
      result = await fn(session);
    }, options);
    return result!;
  } finally {
    await session.endSession();
  }
}
