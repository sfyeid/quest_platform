import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { verifyToken } from '../config/jwt';

interface QuestClient {
  ws: WebSocket;
  userId: string;
  sessionId: string;
  questId: string;
}

export type WsEventType =
  | 'progress_updated'
  | 'session_completed'
  | 'task_answered'
  | 'player_joined'
  | 'player_left'
  | 'error';

export interface WsEvent {
  type: WsEventType;
  payload: Record<string, unknown>;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  // questId -> list of clients (Observer pattern: rooms)
  private rooms: Map<string, Set<QuestClient>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.init();
    console.log('📡 WebSocket manager initialized');
  }

  private init(): void {
    this.wss.on('connection', (ws, req) => {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      const sessionId = url.searchParams.get('sessionId');
      const questId = url.searchParams.get('questId');

      if (!token || !sessionId || !questId) {
        ws.close(1008, 'Missing required params');
        return;
      }

      let userId: string;
      try {
        const payload = verifyToken(token);
        userId = payload.userId;
      } catch {
        ws.close(1008, 'Invalid token');
        return;
      }

      const client: QuestClient = { ws, userId, sessionId, questId };
      this.addToRoom(questId, client);
      console.log(`[WS] User ${userId} joined quest room ${questId}`);

      // Notify others
      this.broadcastToRoom(questId, {
        type: 'player_joined',
        payload: { userId, sessionId },
      }, userId);

      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString()) as WsEvent;
          // Client-side ping keepalive
          if ((msg as unknown as { type: string }).type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong' }));
          }
        } catch {
          ws.close(1008, 'Invalid JSON');
        }
      });

      ws.on('close', () => {
        this.removeFromRoom(questId, client);
        this.broadcastToRoom(questId, {
          type: 'player_left',
          payload: { userId, sessionId },
        }, userId);
        console.log(`[WS] User ${userId} left quest room ${questId}`);
      });

      ws.on('error', (err) => {
        console.error(`[WS] Error for user ${userId}:`, err.message);
      });
    });
  }

  // Broadcast event to all clients in a quest room (Observer notify)
  broadcastToRoom(questId: string, event: WsEvent, excludeUserId?: string): void {
    const room = this.rooms.get(questId);
    if (!room) return;

    const message = JSON.stringify(event);
    room.forEach((client) => {
      if (excludeUserId && client.userId === excludeUserId) return;
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }

  // Send event to specific session
  sendToSession(sessionId: string, event: WsEvent): void {
    this.rooms.forEach((clients) => {
      clients.forEach((client) => {
        if (client.sessionId === sessionId && client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify(event));
        }
      });
    });
  }

  private addToRoom(questId: string, client: QuestClient): void {
    if (!this.rooms.has(questId)) {
      this.rooms.set(questId, new Set());
    }
    this.rooms.get(questId)!.add(client);
  }

  private removeFromRoom(questId: string, client: QuestClient): void {
    const room = this.rooms.get(questId);
    if (!room) return;
    room.delete(client);
    if (room.size === 0) this.rooms.delete(questId);
  }

  getRoomSize(questId: string): number {
    return this.rooms.get(questId)?.size ?? 0;
  }
}
