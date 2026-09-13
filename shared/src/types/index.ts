export type UserRole = 'customer' | 'support' | 'admin' | 'superadmin';
export type UserStatus = 'active' | 'blocked' | 'suspended';

export interface IUser {
  _id: string;
  telegramId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  languageCode: string;
  avatarUrl?: string;
  balance: number; // Stored in smallest unit (e.g., cents or paisa)
  status: UserStatus;
  role: UserRole;
  referralCode: string;
  referredBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductStatus = 'active' | 'inactive' | 'out_of_stock' | 'hidden';
export type DeliveryType = 'instant_auto' | 'manual';

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  features: string[];
  price: number;
  discountPrice?: number;
  imageUrl: string;
  gallery: string[];
  stock: number;
  deliveryType: DeliveryType;
  deliveryTime: string;
  instructions?: string;
  terms?: string;
  tags: string[];
  isFeatured: boolean;
  isPopular: boolean;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type InventoryStatus = 'available' | 'reserved' | 'sold' | 'expired';

export interface IInventoryItem {
  _id: string;
  productId: string;
  content: string; // Encrypted account/code payload
  status: InventoryStatus;
  reservedAt?: Date;
  soldAt?: Date;
  orderId?: string;
  createdAt: Date;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed' | 'refunded';
export type DeliveryStatus = 'unassigned' | 'delivered' | 'failed';

export interface IOrder {
  _id: string;
  orderId: string;
  userId: string;
  productId: string;
  productSnapshot: {
    name: string;
    price: number;
    deliveryType: DeliveryType;
  };
  amount: number;
  discount: number;
  finalAmount: number;
  status: OrderStatus;
  deliveryStatus: DeliveryStatus;
  inventoryItemId?: string;
  deliveredContent?: string;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionType = 
  | 'deposit' 
  | 'purchase' 
  | 'refund' 
  | 'bonus' 
  | 'referral' 
  | 'withdrawal' 
  | 'admin_adjustment';

export interface IWalletTransaction {
  _id: string;
  transactionId: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string;
  description: string;
  createdAt: Date;
}

export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}
