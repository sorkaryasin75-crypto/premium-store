import { ObjectId } from 'mongodb';
import { getDB } from '../db';
import { CategoryDocument, ProductDocument } from '../db/models/Product';
import { ProductType } from '@premium-store/shared';

export class ProductService {
  // Categories
  static async createCategory(name: string, slug: string, icon?: string, sortOrder = 0) {
    const db = getDB();
    const category: CategoryDocument = {
      name,
      slug,
      icon,
      sortOrder,
      isActive: true,
      createdAt: new Date(),
    };
    const result = await db.collection<CategoryDocument>('categories').insertOne(category);
    return { ...category, _id: result.insertedId };
  }

  static async getActiveCategories() {
    const db = getDB();
    return db.collection<CategoryDocument>('categories')
      .find({ isActive: true })
      .sort({ sortOrder: 1 })
      .toArray();
  }

  // Products
  static async createProduct(data: {
    categoryId: string;
    title: string;
    slug: string;
    description: string;
    type: ProductType;
    price: number;
    instructionText?: string;
  }) {
    const db = getDB();
    const product: ProductDocument = {
      categoryId: new ObjectId(data.categoryId),
      title: data.title,
      slug: data.slug,
      description: data.description,
      type: data.type,
      price: data.price,
      stockCount: 0,
      isAvailable: true,
      instructionText: data.instructionText,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<ProductDocument>('products').insertOne(product);
    return { ...product, _id: result.insertedId };
  }

  static async getStorefrontProducts(categoryId?: string) {
    const db = getDB();
    const query: any = { isAvailable: true };
    if (categoryId) {
      query.categoryId = new ObjectId(categoryId);
    }
    return db.collection<ProductDocument>('products').find(query).toArray();
  }

  static async getProductById(id: string) {
    const db = getDB();
    return db.collection<ProductDocument>('products').findOne({ _id: new ObjectId(id) });
  }
}
