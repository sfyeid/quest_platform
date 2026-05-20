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
import { prisma } from './config/prisma';
import { seedDatabase } from './seed';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Open CORS for all origins (academic project)
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manual seed trigger — protected by secret token
app.post('/api/admin/seed', async (req, res) => {
  const secret = req.headers['x-seed-secret'];
  if (secret !== (process.env.SEED_SECRET || 'seed_quest_2026')) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  try {
    await seedDatabase();
    res.json({ ok: true, message: 'Seed completed' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/quests', questRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/users', userRouter);

app.use(errorHandler);

const wsManager = new WebSocketManager(server);
export { wsManager };

const PORT = process.env.PORT || 4000;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log('WebSocket ready');

  // Auto-seed if DB is empty
  try {
    const count = await prisma.user.count();
    console.log(`DB user count: ${count}`);
    if (count === 0) {
      console.log('DB empty — running seed...');
      await seedDatabase();
    } else {
      console.log('DB has data — skipping seed.');
    }
  } catch (err) {
    console.error('Auto-seed error:', err);
  }
});

export default app;
