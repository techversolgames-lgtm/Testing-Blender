import { useState, useEffect, useCallback, useRef } from 'react';

const useWebSocket = (url) => {
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const throttleTimerRef = useRef(null);
  const pendingMessageRef = useRef(null);

  useEffect(() => {
    const websocket = new WebSocket(url);
    websocket.binaryType = 'arraybuffer';
    
    websocket.addEventListener('open', () => setIsConnected(true));
    websocket.addEventListener('close', () => setIsConnected(false));
    websocket.addEventListener('error', () => setIsConnected(false));
    
    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [url]);

  const sendMessage = useCallback((message) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    // Immediate send for schema requests
    if (message.type === 'schema') {
      ws.send(JSON.stringify(message));
      return;
    }

    // Throttle parameter updates
    pendingMessageRef.current = message;
    
    if (!throttleTimerRef.current) {
      throttleTimerRef.current = setTimeout(() => {
        if (pendingMessageRef.current && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(pendingMessageRef.current));
          pendingMessageRef.current = null;
        }
        throttleTimerRef.current = null;
      }, 40);
    }
  }, [ws]);

  return { ws, isConnected, sendMessage };
};

export default useWebSocket;
