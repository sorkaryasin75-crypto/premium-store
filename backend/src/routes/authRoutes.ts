import { FastifyInstance } from 'fastify';
import { telegramAuthGuard } from '../middleware/validateTelegramInitData';
import { AuthService } from '../services/authService';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/api/auth/telegram',
    { preHandler: [telegramAuthGuard] },
    async (request, reply) => {
      const tgUser = (request as any).telegramUser;

      const user = await AuthService.authenticateTelegramUser(tgUser);

      if (user.isBanned) {
        return reply.status(403).send({
          success: false,
          error: { code: 'ACCOUNT_BANNED', message: 'Your account has been suspended.' },
        });
      }

      // Generate Access Token
      const token = fastify.jwt.sign(
        {
          userId: user._id?.toString(),
          telegramId: user.telegramId,
          role: user.role,
        },
        { expiresIn: '7d' }
      );

      return reply.send({
        success: true,
        data: {
          token,
          user: {
            id: user._id?.toString(),
            telegramId: user.telegramId,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            balance: user.balance,
            role: user.role,
          },
        },
      });
    }
  );
}
