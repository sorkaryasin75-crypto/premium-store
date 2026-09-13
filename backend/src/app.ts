import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { connectDB } from './db';
import { createDatabaseIndexes } from './db/indexes';

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    },
    trustProxy: true,
  });

  // Security & CORS
  await fastify.register(helmet, { contentSecurityPolicy: false });
  
  const origins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000', 'http://localhost:3001'];

  await fastify.register(cors, {
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  // Initialize Database Connection & Ensure Indexes
  try {
    const { db } = await connectDB();
    await createDatabaseIndexes(db);
  } catch (error) {
    fastify.log.error('Failed to initialize MongoDB connection', error);
    process.exit(1);
  }

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
