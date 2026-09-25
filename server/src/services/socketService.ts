import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { config, getAllowedOrigins } from '../config/env.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { NotificationDevice } from '../models/NotificationDevice.js';

let ioInstance: SocketIOServer | null = null;

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: getAllowedOrigins() as any,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      const deviceId = socket.handshake.auth.deviceId || socket.handshake.query.deviceId;

      if (!token) {
        return next(new Error('Authentication token required for WebSocket.'));
      }

      const decoded = verifyAccessToken(token);
      (socket as any).userId = decoded.userId;
      (socket as any).deviceId = deviceId;
      next();
    } catch (err) {
      next(new Error('Invalid token for WebSocket connection.'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const userId = (socket as any).userId;
    const deviceId = (socket as any).deviceId;

    console.log(`[Socket] User ${userId} connected (socketId: ${socket.id}, deviceId: ${deviceId || 'web'})`);
    
    // Join user-specific private room
    socket.join(`user:${userId}`);

    // Track device status in DB if deviceId is provided
    if (deviceId) {
      await NotificationDevice.findOneAndUpdate(
        { userId, deviceId },
        {
          socketId: socket.id,
          connectionStatus: 'online',
          lastSeen: new Date(),
        },
        { upsert: false }
      ).catch((err) => console.error('[Socket] Device tracking error:', err.message));
    }

    // Handle heartbeat/ping
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // Handle notification acknowledgment
    socket.on('notification:ack', (data) => {
      console.log(`[Socket] Notification acknowledged by user ${userId}:`, data);
    });

    socket.on('disconnect', async () => {
      console.log(`[Socket] User ${userId} disconnected (socketId: ${socket.id})`);
      if (deviceId) {
        await NotificationDevice.findOneAndUpdate(
          { userId, deviceId },
          {
            connectionStatus: 'offline',
            lastSeen: new Date(),
          }
        ).catch(() => {});
      }
    });
  });

  ioInstance = io;
  return io;
}

export function getIO(): SocketIOServer | null {
  return ioInstance;
}

export function emitToUser(userId: string, event: string, payload: any): void {
  if (!ioInstance) return;
  ioInstance.to(`user:${userId}`).emit(event, payload);
}
