import { useEffect, useRef, useState, useCallback } from 'react';

const useSocket = (url, onMessage, options = {}) => {
  const {
    maxDelay = 30000,
    initialDelay = 1000,
    backoffFactor = 2,
    maxAttempts = 15,
  } = options;

  const [status, setStatus] = useState('Disconnected');
  const socketRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const reconnectTimerRef = useRef(null);
  const reconnectCountRef = useRef(0);
  const isExplicitCloseRef = useRef(false);

  // Always keep onMessageRef up to date without triggering reconnection
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (!url) return;

    // Prevent duplicate connections if socket is already CONNECTING or OPEN
    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.CONNECTING ||
        socketRef.current.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    // Clear any existing reconnection timer before attempting a new connect
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    setStatus(reconnectCountRef.current > 0 ? 'Reconnecting' : 'Connecting');

    try {
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus('Connected');
        reconnectCountRef.current = 0;
      };

      socket.onmessage = (event) => {
        if (onMessageRef.current) {
          try {
            const data = JSON.parse(event.data);
            onMessageRef.current(data);
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        }
      };

      socket.onerror = (error) => {
        if (socketRef.current?.readyState !== WebSocket.CLOSED) {
          console.warn('WebSocket connection error:', error);
        }
      };

      socket.onclose = () => {
        socketRef.current = null;

        // Do not attempt to reconnect if component unmounted or explicitly closed
        if (isExplicitCloseRef.current) {
          setStatus('Disconnected');
          return;
        }

        setStatus('Reconnecting');
        scheduleReconnect();
      };
    } catch (err) {
      console.error('WebSocket creation failed:', err);
      setStatus('Reconnecting');
      scheduleReconnect();
    }
  }, [url, maxDelay, initialDelay, backoffFactor]);

  const scheduleReconnect = useCallback(() => {
    if (isExplicitCloseRef.current) return;

    if (maxAttempts > 0 && reconnectCountRef.current >= maxAttempts) {
      console.warn(`WebSocket reconnection limit reached (${maxAttempts} attempts). Stopping auto-reconnect.`);
      setStatus('Disconnected');
      return;
    }

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }

    // Exponential backoff calculation: min(initialDelay * (backoffFactor ^ attempt), maxDelay) + jitter
    const delay = Math.min(
      initialDelay * Math.pow(backoffFactor, reconnectCountRef.current),
      maxDelay
    );
    const jitter = Math.floor(Math.random() * 500); // 0-500ms jitter
    const totalDelay = delay + jitter;

    reconnectCountRef.current += 1;

    reconnectTimerRef.current = setTimeout(() => {
      connect();
    }, totalDelay);
  }, [connect, initialDelay, backoffFactor, maxDelay, maxAttempts]);

  useEffect(() => {
    isExplicitCloseRef.current = false;
    reconnectCountRef.current = 0;
    connect();

    return () => {
      isExplicitCloseRef.current = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.onopen = null;
        socketRef.current.onmessage = null;
        socketRef.current.onerror = null;
        socketRef.current.onclose = null;
        socketRef.current.close();
        socketRef.current = null;
      }
      setStatus('Disconnected');
    };
  }, [url, connect]);

  const sendMessage = useCallback((message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        typeof message === 'string' ? message : JSON.stringify(message)
      );
    } else {
      console.warn('Cannot send message: WebSocket is not open.');
    }
  }, []);

  return { sendMessage, status };
};

export default useSocket;

