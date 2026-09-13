import { ObjectId } from 'mongodb';
import { ProductType } from '@premium-store/shared';

export interface CategoryDocument {
  _id?: ObjectId;
  name: string;
  slug: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
}

export interface ProductDocument {
  _id?: ObjectId;
  categoryId: ObjectId;
  title: string;
  slug: string;
  description: string;
  type: ProductType;
  price: number;
  stockCount: number;
  isAvailable: boolean;
  instructionText?: string;
  createdAt: Date;
  updatedAt: Date;
}
