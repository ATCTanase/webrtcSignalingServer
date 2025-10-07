// server.js
const WebSocket = require('ws');

const PORT = process.env.PORT || 443;

const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    ws.send(`Echo: ${message}`);
  });
});

console.log(`WebSocket server running on port ${PORT}`);
