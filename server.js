const WebSocket = require('wss');

const wss = new WebSocket.Server({ port: 8080 }); // ポートは必要に応じて変更可能

let connectedClients = []; // 接続しているクライアントを保持

console.log('WebSocket signaling server started on port 8080');

wss.on('connection', ws => {
    console.log('Client connected');
    connectedClients.push(ws); // 新しいクライアントをリストに追加

    ws.on('message', message => {
        console.log(`Received message: ${message}`);
        // 受信したメッセージを他の全ての接続済みクライアントに転送
        connectedClients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        // クライアントが切断したらリストから削除
        connectedClients = connectedClients.filter(client => client !== ws);
    });

    ws.on('error', error => {
        console.error('WebSocket error:', error);
    });
});