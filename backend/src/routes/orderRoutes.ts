import { FastifyInstance } from 'fastify';
import { OrderService } from '../services/orderService';
import { authenticate } from '../middleware/auth';

export async function orderRoutes(fastify: FastifyInstance) {
  // Checkout / Place Order Endpoint
  fastify.post(
    '/api/orders/checkout',
    { preHandler: [authenticate] },
    async (req, reply) => {
      const jwtUser = req.user as { userId: string };
      const { productId, quantity } = req.body as { productId: string; quantity: number };

      if (!productId || !quantity) {
        return reply.status(400).send({
          success: false,
          message: 'productId and valid quantity are required',
        });
      }

      try {
        const orderResult = await OrderService.createOrder(jwtUser.userId, productId, quantity);
        return reply.status(201).send({
          success: true,
          message: 'Order completed and keys delivered successfully.',
          data: orderResult,
        });
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          message: err.message || 'Failed to process order',
        });
      }
    }
  );

  // User Order History
  fastify.get(
    '/api/orders/my-orders',
    { preHandler: [authenticate] },
    async (req, reply) => {
      const jwtUser = req.user as { userId: string };
      const orders = await OrderService.getUserOrders(jwtUser.userId);
      return reply.send({ success: true, data: orders });
    }
  );

  // Order Details Route
  fastify.get(
    '/api/orders/:id',
    { preHandler: [authenticate] },
    async (req, reply) => {
      const jwtUser = req.user as { userId: string };
      const { id } = req.params as { id: string };

      const order = await OrderService.getOrderById(id, jwtUser.userId);
      if (!order) {
        return reply.status(404).send({ success: false, message: 'Order not found' });
      }

      return reply.send({ success: true, data: order });
    }
  );
}
