import crypto from 'crypto';
import { FastifyRequest, FastifyReply } from 'fastify';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export function parseAndValidateInitData(
  initDataRaw: string,
  botToken: string
): { isValid: boolean; user?: TelegramUser } {
  try {
    const urlParams = new URLSearchParams(initDataRaw);
    const hash = urlParams.get('hash');

    if (!hash) return { isValid: false };

    urlParams.delete('hash');

    const params: string[] = [];
    for (const [key, value] of urlParams.entries()) {
      params.push(`${key}=${value}`);
    }

    params.sort();
    const dataCheckString = params.join('\n');

    // HMAC-SHA256 Calculation
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return { isValid: false };
    }

    const userParam = urlParams.get('user');
    const user: TelegramUser | undefined = userParam ? JSON.parse(userParam) : undefined;

    return { isValid: true, user };
  } catch (err) {
    return { isValid: false };
  }
}

export async function telegramAuthGuard(request: FastifyRequest, reply: FastifyReply) {
  const initDataHeader = request.headers['x-telegram-init-data'] as string;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!initDataHeader || !botToken) {
    return reply.status(401).send({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Telegram initData or Bot Token missing' },
    });
  }

  const { isValid, user } = parseAndValidateInitData(initDataHeader, botToken);

  if (!isValid || !user) {
    return reply.status(401).send({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid Telegram WebApp security hash' },
    });
  }

  (request as any).telegramUser = user;
}
