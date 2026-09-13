import { ObjectId } from 'mongodb';
import { InventoryStatus } from '@premium-store/shared';

export interface InventoryItemDocument {
  _id?: ObjectId;
  productId: ObjectId;
  content: string; // Encrypted Serial Key or Account Credentials
  status: InventoryStatus; // AVAILABLE, SOLD, RESERVED
  orderId?: ObjectId;
  soldToUserId?: ObjectId;
  soldAt?: Date;
  createdAt: Date;
}
