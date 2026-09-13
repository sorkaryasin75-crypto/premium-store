import { FastifyInstance } from 'fastify';
import { InventoryService } from '../services/inventoryService';
import { authenticate, requireAdmin } from '../middleware/auth';

export async function inventoryRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/api/admin/inventory/bulk-add',
    { preHandler: [authenticate, requireAdmin] },
    async (req, reply) => {
      const { productId, items } = req.body as { productId: string; items: string[] };

      if (!productId || !Array.isArray(items) || items.length === 0) {
        return reply.status(400).send({
          success: false,
          message: 'productId and non-empty items array are required',
        });
      }

      const result = await InventoryService.bulkAddInventory(productId, items);
      return reply.status(201).send({
        success: true,
        message: `${result.insertedCount} serial keys added successfully.`,
        data: result,
      });
    }
  );
}
