import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fastifyJwt from '@fastify/jwt';
import { connectDB } from './db';
import { createDatabaseIndexes } from './db/indexes';
import { initFirebase } from './services/firebaseService';
import { authRoutes } from './routes/authRoutes';
import { productRoutes } from './routes/productRoutes';
import { inventoryRoutes } from './routes/inventoryRoutes';
import { orderRoutes } from './routes/orderRoutes';
import { depositRoutes } from './routes/depositRoutes';

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

  // Register JWT Plugin
  await fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'super_secret_jwt_key_min_32_characters_long_for_production',
  });

  // Database Connection
  try {
    const { db } = await connectDB();
    await createDatabaseIndexes(db);
    initFirebase(); // Initialize Firebase Admin SDK
  } catch (error) {
    fastify.log.error('Failed to initialize database or services', error);
    process.exit(1);
  }

  // Register Application Routes
  await fastify.register(authRoutes);
  await fastify.register(productRoutes);
  await fastify.register(inventoryRoutes);
  await fastify.register(orderRoutes);
  await fastify.register(depositRoutes);

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
