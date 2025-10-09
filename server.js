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

// シグナリングサーバーのコード
socket.on('message', message => {
  // 受信したメッセージの型を確認
  console.log(`Received message type: ${typeof message}`);
  console.log("Received message content:", message);

  let msgToSend = message; // デフォルトは受信したまま

  // もしメッセージがBuffer型なら、文字列に変換
  if (Buffer.isBuffer(message)) {
    msgToSend = message.toString('utf8');
    console.log("Converted Buffer message to string for sending:", msgToSend);
  }

  // 接続している他のクライアントにメッセージをブロードキャスト
  wss.clients.forEach(client => {
    if (client !== socket && client.readyState === WebSocket.OPEN) {
      console.log("Sending message to client:", msgToSend); // 送信前にログを追加
      client.send(msgToSend); // 変換後のメッセージを送信
    }
  });
});

  socket.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));
