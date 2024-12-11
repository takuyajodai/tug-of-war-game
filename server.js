const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;
let ropePosition = 0; // 綱の位置

// 静的ファイルを提供
app.use(express.static('public'));

// ソケット通信の設定
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // 初期状態を送信
    socket.emit('update', ropePosition);

    // クライアントから綱の引っ張り方向を受信
    socket.on('pull', (direction) => {
        ropePosition += direction * 1; // 左: -1, 右: +1
        ropePosition = Math.max(-100, Math.min(100, ropePosition)); // 綱の範囲を制限

        // すべてのクライアントに更新データを送信
        io.emit('update', ropePosition);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// サーバ起動
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});