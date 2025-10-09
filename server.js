// server.js
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('✅ WebRTC signaling server is running\n');
});

const wss = new WebSocket.Server({ server, path: '/ws' });

// --- 接続状態を保持 ---
let browserSocket = null;
let androidSocket = null;
let latestOffer = null; // ブラウザのOfferを一時保持

wss.on('connection', socket => {
  console.log('🟢 Client connected');

  socket.on('message', rawMsg => {
    let msgText = Buffer.isBuffer(rawMsg) ? rawMsg.toString('utf8') : rawMsg;
    console.log("📨 Received:", msgText);

    let msg;
    try {
      msg = JSON.parse(msgText);
    } catch (e) {
      console.error("❌ Failed to parse message:", e);
      return;
    }

    switch (msg.type) {
      // ---- ブラウザ登録 ----
      case 'register':
        if (msg.role === 'browser') {
          browserSocket = socket;
          console.log('🌐 Browser registered');
          // もし古いOfferが残っていればクリア
          latestOffer = null;
        } else if (msg.role === 'android') {
          androidSocket = socket;
          console.log('🤖 Android registered');

          // Androidが後から来た場合、最新のOfferを送る
          if (latestOffer && androidSocket.readyState === WebSocket.OPEN) {
            console.log('📤 Sending stored offer to Android');
            androidSocket.send(JSON.stringify({ type: 'offer', sdp: latestOffer }));
          }
        }
        break;

      // ---- ブラウザからのOffer ----
      case 'offer':
        latestOffer = msg.sdp;
        console.log('💾 Offer stored');
        if (androidSocket && androidSocket.readyState === WebSocket.OPEN) {
          console.log('📤 Forwarding offer to Android');
          androidSocket.send(JSON.stringify(msg));
        }
        break;

      // ---- AndroidからのAnswer ----
      case 'answer':
        if (browserSocket && browserSocket.readyState === WebSocket.OPEN) {
          console.log('📤 Forwarding answer to Browser');
          browserSocket.send(JSON.stringify(msg));
        }
        break;

      // ---- Candidate ----
      case 'candidate':
        if (socket === browserSocket && androidSocket?.readyState === WebSocket.OPEN) {
          androidSocket.send(JSON.stringify(msg));
        } else if (socket === androidSocket && browserSocket?.readyState === WebSocket.OPEN) {
          browserSocket.send(JSON.stringify(msg));
        }
        break;

      // ---- 明示的切断 ----
      case 'disconnect':
        if (msg.role === 'browser') {
          console.log('🚫 Browser manually disconnected. Clearing offer.');
          latestOffer = null;
          browserSocket = null;
        } else if (msg.role === 'android') {
          console.log('🚫 Android manually disconnected.');
          androidSocket = null;
        }
        break;

      default:
        console.warn('⚠️ Unknown message type:', msg.type);
    }
  });

  socket.on('close', () => {
    console.log('🔴 Client disconnected');
    if (socket === browserSocket) {
      console.log('Browser socket closed — clearing offer');
      browserSocket = null;
      latestOffer = null;
    } else if (socket === androidSocket) {
      console.log('Android socket closed');
      androidSocket = null;
    }
        wss.clients.forEach(client => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "peer-disconnected" }));
        }
    });
  });
});

server.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));
