// server.js
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebRTC signaling server is running\n');
});

const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', socket => {
  console.log('Client connected');

  socket.on('message', message => {
    console.log('Received:', message);
    // 受け取ったメッセージを全クライアントにブロードキャスト
    wss.clients.forEach(client => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));
