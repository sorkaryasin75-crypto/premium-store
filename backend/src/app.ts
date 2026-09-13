import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    },
    trustProxy: true,
  });

  // Security Hardening Headers
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  // CORS Configuration
  const origins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000', 'http://localhost:3001'];

  await fastify.register(cors, {
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  // Health Check Endpoint
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  return fastify;
}
