// server.js
const http = require('http');
const WebSocket = require('ws');

const server = http.createServer();
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', socket => {
  console.log('Client connected');
  socket.on('message', message => {
    console.log('Received:', message);
    // Echo back
    socket.send(message);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
