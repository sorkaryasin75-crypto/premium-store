import { Db } from 'mongodb';

export async function createDatabaseIndexes(db: Db): Promise<void> {
  // Users Collection Indexes
  await db.collection('users').createIndex({ telegramId: 1 }, { unique: true });
  await db.collection('users').createIndex({ role: 1 });

  // Products & Categories Indexes
  await db.collection('products').createIndex({ slug: 1 }, { unique: true });
  await db.collection('products').createIndex({ categoryId: 1, isAvailable: 1 });

  // Inventory Items Indexes (Optimized for FIFO Serial Key Allocation)
  await db.collection('inventory_items').createIndex(
    { productId: 1, status: 1, createdAt: 1 }
  );

  // Orders Collection Indexes
  await db.collection('orders').createIndex({ userId: 1, createdAt: -1 });
  await db.collection('orders').createIndex({ status: 1 });

  // Deposit Requests Indexes
  await db.collection('deposits').createIndex({ userId: 1, createdAt: -1 });
  await db.collection('deposits').createIndex({ status: 1, transactionId: 1 });

  console.log('⚡ All MongoDB Collection Indexes Ensured Successfully');
}
