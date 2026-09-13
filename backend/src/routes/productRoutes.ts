import { FastifyInstance } from 'fastify';
import { ProductService } from '../services/productService';
import { authenticate, requireAdmin } from '../middleware/auth';

export async function productRoutes(fastify: FastifyInstance) {
  // Public Storefront Routes
  fastify.get('/api/categories', async (_req, reply) => {
    const categories = await ProductService.getActiveCategories();
    return reply.send({ success: true, data: categories });
  });

  fastify.get('/api/products', async (req, reply) => {
    const { categoryId } = req.query as { categoryId?: string };
    const products = await ProductService.getStorefrontProducts(categoryId);
    return reply.send({ success: true, data: products });
  });

  fastify.get('/api/products/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const product = await ProductService.getProductById(id);
    if (!product) {
      return reply.status(404).send({ success: false, message: 'Product not found' });
    }
    return reply.send({ success: true, data: product });
  });

  // Admin Routes
  fastify.post(
    '/api/admin/categories',
    { preHandler: [authenticate, requireAdmin] },
    async (req, reply) => {
      const { name, slug, icon, sortOrder } = req.body as any;
      const category = await ProductService.createCategory(name, slug, icon, sortOrder);
      return reply.status(201).send({ success: true, data: category });
    }
  );

  fastify.post(
    '/api/admin/products',
    { preHandler: [authenticate, requireAdmin] },
    async (req, reply) => {
      const body = req.body as any;
      const product = await ProductService.createProduct(body);
      return reply.status(201).send({ success: true, data: product });
    }
  );
}
