import logger from './loggerService.js';

function createWebSocketClient (url) {
    let socket = null;
    const messageHandlers = new Map();

    function connect () {
        socket = new WebSocket(url);

        socket.onopen = () => {
            logger.info('WebSocket connection established');
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const { requestId, data } = message;
            if (messageHandlers.has(requestId)) {
                messageHandlers.get(requestId)(message);
            }
        };

        socket.onclose = () => {
            logger.error('WebSocket connection closed. Attempting to reconnect...');
            setTimeout(() => {
                logger.info('Reconnecting WebSocket...');
                connect();
            }, 5000);
        };

        socket.onerror = (error) => {
            logger.error('WebSocket error:', error);
        };
    }

    function send (requestId, payload) {
        if (!socket) {
            logger.error('WebSocket is not initialized. Cannot send message.');
            return;
        }

        if (socket.readyState !== WebSocket.OPEN) {
            logger.error('WebSocket is not open. Cannot send message.');
            return;
        }

        socket.send(JSON.stringify({ requestId, ...payload }));
    }

    function onMessage (requestId, handler) {
        messageHandlers.set(requestId, handler);
    }

    function removeMessageHandler (requestId) {
        messageHandlers.delete(requestId);
    }

    return {
        connect,
        send,
        onMessage,
        removeMessageHandler
    };
}

export default createWebSocketClient;
