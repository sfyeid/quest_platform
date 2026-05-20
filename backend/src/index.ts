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

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/quests', questRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/users', userRouter);

// Error handler
app.use(errorHandler);

// WebSocket
const wsManager = new WebSocketManager(server);
export { wsManager };

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket ready`);
});

export default app;
