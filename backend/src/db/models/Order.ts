import { ObjectId } from 'mongodb';
import { OrderStatus } from '@premium-store/shared';

export interface OrderItem {
  productId: ObjectId;
  productTitle: string;
  unitPrice: number;
  quantity: number;
  deliveredItems: string[]; // Delivered Keys / Account Details
}

export interface OrderDocument {
  _id?: ObjectId;
  userId: ObjectId;
  telegramId: number;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
}
