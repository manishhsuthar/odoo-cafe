import { useEffect, useRef } from 'react';

const useSocket = (url, onMessage) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!url) return;

    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      if (onMessage) {
        onMessage(JSON.parse(event.data));
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [url, onMessage]);

  const sendMessage = (message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  };

  return { sendMessage };
};

export default useSocket;
