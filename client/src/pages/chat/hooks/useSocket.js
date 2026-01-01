import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';

const ENDPOINT = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const useSocket = (user) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(() => {
    if (!user?._id) return;

    try {
      socketRef.current = io(ENDPOINT, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        query: {
          userId: user._id,
          username: user.username
        }
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        setError(null);
        
        // Setup user
        socketRef.current.emit('setup', user);
      });

      socketRef.current.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        setError(err.message);
        setConnected(false);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setConnected(false);
      });

      socketRef.current.on('error', (err) => {
        console.error('Socket error:', err);
        setError(err.message);
      });

    } catch (err) {
      console.error('Failed to initialize socket:', err);
      setError(err.message);
    }
  }, [user]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current && connected) {
      socketRef.current.emit(event, data);
    }
  }, [connected]);

  const on = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  }, []);

  const off = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  }, []);

  useEffect(() => {
    if (user) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);

  return {
    socket: socketRef.current,
    connected,
    error,
    emit,
    on,
    off,
    reconnect: connect
  };
};

export default useSocket;