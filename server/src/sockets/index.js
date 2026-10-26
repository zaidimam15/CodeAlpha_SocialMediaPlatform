import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

let ioInstance = null;

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        // Allow anonymous sockets for public feeds if needed, but flag them
        socket.user = null;
        return next();
      }

      const decoded = verifyToken(token);
      if (!decoded || !decoded.id) {
        socket.user = null;
        return next();
      }

      const user = await User.findById(decoded.id);
      if (user) {
        socket.user = user;
      }
      next();
    } catch (err) {
      next();
    }
  });

  io.on('connection', (socket) => {
    if (socket.user) {
      const userRoom = `user:${socket.user._id.toString()}`;
      socket.join(userRoom);
      console.log(`⚡ Socket connected: ${socket.id} (User: @${socket.user.username}) -> Joined ${userRoom}`);
    } else {
      console.log(`⚡ Anonymous Socket connected: ${socket.id}`);
    }

    // Join custom room (e.g. post detail view for live comments)
    socket.on('join_post', (postId) => {
      if (postId) {
        socket.join(`post:${postId}`);
      }
    });

    socket.on('leave_post', (postId) => {
      if (postId) {
        socket.leave(`post:${postId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  ioInstance = io;
  return io;
}

export function getIO() {
  return ioInstance;
}

export function sendNotificationToUser(recipientId, notificationData) {
  if (!ioInstance || !recipientId) return;
  const room = `user:${recipientId.toString()}`;
  ioInstance.to(room).emit('new_notification', notificationData);
}

export function broadcastPostEvent(postId, eventName, payload) {
  if (!ioInstance) return;
  if (postId) {
    ioInstance.to(`post:${postId}`).emit(eventName, payload);
  }
  ioInstance.emit(eventName, payload);
}
