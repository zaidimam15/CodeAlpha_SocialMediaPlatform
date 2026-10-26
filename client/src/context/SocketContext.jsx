import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';
import { api } from '../services/api.js';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial unread count
  useEffect(() => {
    if (isAuthenticated) {
      api.notifications
        .getAll(1)
        .then((data) => {
          if (data.success && typeof data.unreadCount === 'number') {
            setUnreadCount(data.unreadCount);
          }
        })
        .catch(() => {});
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!token || !isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketInstance = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Socket connected to Connectify server');
    });

    socketInstance.on('new_notification', (notification) => {
      setUnreadCount((prev) => prev + 1);

      const senderName = notification.sender?.displayName || 'Someone';
      let message = `${senderName} interacted with you`;

      if (notification.type === 'like') {
        message = `${senderName} liked your post ❤️`;
      } else if (notification.type === 'comment') {
        message = `${senderName} commented on your post 💬`;
      } else if (notification.type === 'follow') {
        message = `${senderName} started following you 🌟`;
      }

      showToast(message, 'info');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token, isAuthenticated, showToast]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        unreadCount,
        setUnreadCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
