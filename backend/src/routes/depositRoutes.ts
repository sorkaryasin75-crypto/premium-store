import { FastifyInstance } from 'fastify';
import { DepositService } from '../services/depositService';
import { authenticate, requireAdmin } from '../middleware/auth';
import { PaymentGateway } from '@premium-store/shared';

export async function depositRoutes(fastify: FastifyInstance) {
  // Public / Customer Payment Methods Info
  fastify.get('/api/deposits/payment-methods', async (_req, reply) => {
    const methods = await DepositService.getPaymentMethods();
    return reply.send({ success: true, data: methods });
  });

  // Customer Deposit Submission Endpoint
  fastify.post(
    '/api/deposits/request',
    { preHandler: [authenticate] },
    async (req, reply) => {
      const jwtUser = req.user as { userId: string };
      const { amount, gateway, transactionId, senderNumber } = req.body as {
        amount: number;
        gateway: PaymentGateway;
        transactionId: string;
        senderNumber?: string;
      };

      if (!amount || !gateway || !transactionId) {
        return reply.status(400).send({
          success: false,
          message: 'amount, gateway and transactionId are required fields',
        });
      }

      try {
        const deposit = await DepositService.createDepositRequest(
          jwtUser.userId,
          amount,
          gateway,
          transactionId,
          senderNumber
        );

        return reply.status(201).send({
          success: true,
          message: 'Deposit request submitted successfully. Waiting for admin approval.',
          data: deposit,
        });
      } catch (err: any) {
        return reply.status(400).send({ success: false, message: err.message });
      }
    }
  );

  // Customer Deposit History
  fastify.get(
    '/api/deposits/my-deposits',
    { preHandler: [authenticate] },
    async (req, reply) => {
      const jwtUser = req.user as { userId: string };
      const deposits = await DepositService.getUserDeposits(jwtUser.userId);
      return reply.send({ success: true, data: deposits });
    }
  );

  // Admin Pending Deposits View
  fastify.get(
    '/api/admin/deposits/pending',
    { preHandler: [authenticate, requireAdmin] },
    async (_req, reply) => {
      const deposits = await DepositService.getPendingDeposits();
      return reply.send({ success: true, data: deposits });
    }
  );

  // Admin Approve Endpoint
  fastify.post(
    '/api/admin/deposits/:id/approve',
    { preHandler: [authenticate, requireAdmin] },
    async (req, reply) => {
      const jwtUser = req.user as { userId: string };
      const { id } = req.params as { id: string };

      try {
        const result = await DepositService.approveDeposit(id, jwtUser.userId);
        return reply.send({
          success: true,
          message: 'Deposit request approved and user balance updated.',
          data: result,
        });
      } catch (err: any) {
        return reply.status(400).send({ success: false, message: err.message });
      }
    }
  );

  // Admin Reject Endpoint
  fastify.post(
    '/api/admin/deposits/:id/reject',
    { preHandler: [authenticate, requireAdmin] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const { reason } = req.body as { reason?: string };

      try {
        await DepositService.rejectDeposit(id, reason);
        return reply.send({
          success: true,
          message: 'Deposit request rejected.',
        });
      } catch (err: any) {
        return reply.status(400).send({ success: false, message: err.message });
      }
    }
  );
}
