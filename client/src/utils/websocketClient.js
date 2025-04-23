function createWebSocketClient(url) {
  let socket = null;
  const messageHandlers = new Map();

  function connect() {
    socket = new WebSocket(url);

    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const { requestId, data } = message;
      if (messageHandlers.has(requestId)) {
        messageHandlers.get(requestId)(data);
      }
    };

    socket.onclose = () => {
      console.error('WebSocket connection closed. Attempting to reconnect...');
      setTimeout(() => {
        console.log('Reconnecting WebSocket...');
        connect();
      }, 5000);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  function send(requestId, payload) {
    if (!socket) {
      console.error('WebSocket is not initialized. Cannot send message.');
      return;
    }

    if (socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not open. Cannot send message.');
      return;
    }

    socket.send(JSON.stringify({ requestId, ...payload }));
  }

  function onMessage(requestId, handler) {
    messageHandlers.set(requestId, handler);
  }

  function removeMessageHandler(requestId) {
    messageHandlers.delete(requestId);
  }

  return {
    connect,
    send,
    onMessage,
    removeMessageHandler,
  };
}

export default createWebSocketClient;