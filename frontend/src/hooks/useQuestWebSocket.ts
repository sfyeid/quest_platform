import { useEffect, useRef, useCallback } from 'react';
import { WsEvent, WsEventType } from '../types';
import { getWsUrl } from '../services/api';

type Handler = (payload: Record<string, unknown>) => void;

interface UseQuestWebSocketOptions {
  questId: string;
  sessionId: string;
  token: string | null;
  onEvent?: Partial<Record<WsEventType, Handler>>;
}

export function useQuestWebSocket({ questId, sessionId, token, onEvent }: UseQuestWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const connect = useCallback(() => {
    if (!token) return;

    const wsBase = getWsUrl();
    const wsUrl = `${wsBase}/ws?token=${token}&questId=${questId}&sessionId=${sessionId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Connected to quest room:', questId);
      // Keepalive ping every 30s
      pingInterval.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };

    ws.onmessage = (event) => {
      try {
        const msg: WsEvent = JSON.parse(event.data);
        const handler = onEvent?.[msg.type];
        if (handler) handler(msg.payload);
      } catch {
        console.error('[WS] Failed to parse message');
      }
    };

    ws.onclose = () => {
      console.log('[WS] Connection closed, reconnecting in 3s...');
      if (pingInterval.current) clearInterval(pingInterval.current);
      // Auto-reconnect
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = (err) => {
      console.error('[WS] Error:', err);
      ws.close();
    };
  }, [questId, sessionId, token, onEvent]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (pingInterval.current) clearInterval(pingInterval.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return wsRef;
}
