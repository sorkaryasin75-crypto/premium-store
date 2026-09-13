import { ObjectId } from 'mongodb';
import { getDB, withTransaction } from '../db';
import { InventoryItemDocument } from '../db/models/InventoryItem';
import { InventoryStatus } from '@premium-store/shared';
import { encryptText } from '../utils/crypto';

export class InventoryService {
  static async bulkAddInventory(productId: string, rawItems: string[]) {
    if (!rawItems.length) return { insertedCount: 0 };

    return withTransaction(async (session) => {
      const db = getDB();
      const pId = new ObjectId(productId);

      const documents: InventoryItemDocument[] = rawItems.map((item) => ({
        productId: pId,
        content: encryptText(item.trim()),
        status: InventoryStatus.AVAILABLE,
        createdAt: new Date(),
      }));

      const result = await db
        .collection<InventoryItemDocument>('inventory_items')
        .insertMany(documents, { session });

      // Update Stock Count on Product
      await db.collection('products').updateOne(
        { _id: pId },
        { $inc: { stockCount: result.insertedCount }, $set: { updatedAt: new Date() } },
        { session }
      );

      return { insertedCount: result.insertedCount };
    });
  }

  static async getProductStockCount(productId: string) {
    const db = getDB();
    return db.collection<InventoryItemDocument>('inventory_items').countDocuments({
      productId: new ObjectId(productId),
      status: InventoryStatus.AVAILABLE,
    });
  }
}
