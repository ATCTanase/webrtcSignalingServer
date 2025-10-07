// Node.js + ws ‚Ì—á
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080, path: '/ws' });

server.on('connection', socket => {
  console.log('Client connected');
  socket.on('message', message => {
    console.log('Received: ', message);
  });
});