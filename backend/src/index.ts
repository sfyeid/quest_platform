import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.routes';
import { questRouter } from './routes/quest.routes';
import { sessionRouter } from './routes/session.routes';
import { userRouter } from './routes/user.routes';
import { WebSocketManager } from './websocket/ws.manager';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/quests', questRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/users', userRouter);

app.use(errorHandler);

const wsManager = new WebSocketManager(server);
export { wsManager };

async function runSeedIfEmpty() {
  try {
    const { prisma } = await import('./config/prisma');
    const count = await prisma.user.count();
    if (count === 0) {
      console.log('Database is empty, running seed...');
      const { main } = await import('./seed');
      await main();
    }
  } catch (err) {
    console.error('Seed check failed:', err);
  }
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log('WebSocket ready');
  await runSeedIfEmpty();
});

export default app;
