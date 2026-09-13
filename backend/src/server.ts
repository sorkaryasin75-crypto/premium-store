import dotenv from 'dotenv';
import path from 'path';

// Load environment configuration
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { buildApp } from './app';

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  const server = await buildApp();

  try {
    await server.listen({ port: PORT, host: HOST });
    server.log.info(`🚀 Fastify Backend Engine listening on http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
