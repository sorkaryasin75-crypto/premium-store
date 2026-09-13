# Premium Telegram Digital Product Store

Production-Ready, High-Performance Digital Product Store accessible via Telegram WebApp & Bot.

## Project Structure
- `shared/` - Shared TypeScript interfaces, types, and Zod validation schemas.
- `backend/` - Fastify + MongoDB + Firebase backend application.
- `frontend/` - React 18 + Vite + Tailwind CSS Telegram WebApp client.
- `admin/` - Management and analytics panel.

## Architecture
- **Primary Data Source:** MongoDB Atlas (ACID Transactions for inventory/balance)
- **Realtime Synchronization:** Firebase Realtime Database
- **Authentication:** Telegram `initData` HMAC-SHA256 signature verification + JWT
