import { ObjectId } from 'mongodb';
import { getDB, withTransaction } from '../db';
import { UserDocument } from '../db/models/User';
import { ProductDocument } from '../db/models/Product';
import { InventoryItemDocument } from '../db/models/InventoryItem';
import { OrderDocument } from '../db/models/Order';
import { InventoryStatus, OrderStatus } from '@premium-store/shared';
import { decryptText } from '../utils/crypto';

export class OrderService {
  static async createOrder(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    return withTransaction(async (session) => {
      const db = getDB();
      const userObjId = new ObjectId(userId);
      const productObjId = new ObjectId(productId);

      // 1. Fetch User and Check Balance
      const user = await db
        .collection<UserDocument>('users')
        .findOne({ _id: userObjId }, { session });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.isBanned) {
        throw new Error('User account is suspended');
      }

      // 2. Fetch Product and Verify Stock
      const product = await db
        .collection<ProductDocument>('products')
        .findOne({ _id: productObjId }, { session });

      if (!product || !product.isAvailable) {
        throw new Error('Product is currently unavailable');
      }

      const totalCost = product.price * quantity;
      if (user.balance < totalCost) {
        throw new Error('Insufficient balance. Please deposit funds first.');
      }

      // 3. FIFO Lock and Claim Available Serial Keys
      const availableItems = await db
        .collection<InventoryItemDocument>('inventory_items')
        .find(
          { productId: productObjId, status: InventoryStatus.AVAILABLE },
          { session }
        )
        .sort({ createdAt: 1 }) // FIFO: Oldest item first
        .limit(quantity)
        .toArray();

      if (availableItems.length < quantity) {
        throw new Error(`Insufficient stock. Only ${availableItems.length} items available.`);
      }

      const itemIds = availableItems.map((item) => item._id!);

      // 4. Create Order Record
      const newOrder: OrderDocument = {
        userId: userObjId,
        telegramId: user.telegramId,
        items: [
          {
            productId: productObjId,
            productTitle: product.title,
            unitPrice: product.price,
            quantity,
            deliveredItems: availableItems.map((item) => decryptText(item.content)),
          },
        ],
        totalAmount: totalCost,
        status: OrderStatus.COMPLETED,
        createdAt: new Date(),
      };

      const orderResult = await db
        .collection<OrderDocument>('orders')
        .insertOne(newOrder, { session });

      const createdOrderId = orderResult.insertedId;

      // 5. Update Inventory Items Status to SOLD
      await db.collection<InventoryItemDocument>('inventory_items').updateMany(
        { _id: { $in: itemIds } },
        {
          $set: {
            status: InventoryStatus.SOLD,
            orderId: createdOrderId,
            soldToUserId: userObjId,
            soldAt: new Date(),
          },
        },
        { session }
      );

      // 6. Deduct User Balance
      await db.collection<UserDocument>('users').updateOne(
        { _id: userObjId },
        { $inc: { balance: -totalCost }, $set: { updatedAt: new Date() } },
        { session }
      );

      // 7. Update Product Stock Count
      await db.collection<ProductDocument>('products').updateOne(
        { _id: productObjId },
        { $inc: { stockCount: -quantity }, $set: { updatedAt: new Date() } },
        { session }
      );

      return {
        orderId: createdOrderId.toString(),
        totalAmount: totalCost,
        items: newOrder.items,
        deliveredData: newOrder.items[0].deliveredItems,
      };
    });
  }

  static async getUserOrders(userId: string) {
    const db = getDB();
    return db
      .collection<OrderDocument>('orders')
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async getOrderById(orderId: string, userId: string) {
    const db = getDB();
    return db.collection<OrderDocument>('orders').findOne({
      _id: new ObjectId(orderId),
      userId: new ObjectId(userId),
    });
  }
}
