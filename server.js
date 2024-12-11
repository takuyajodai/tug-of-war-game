const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

let players = {}; // プレイヤーのドラッグ情報を保存
let ropePosition = 0; // 綱の中点位置

// 静的ファイルを提供
app.use(express.static('public'));

// ソケット通信の設定
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // 新しいプレイヤーの初期化
    players[socket.id] = { dragX: 0 };

    // クライアントからドラッグ情報を受信
    socket.on('drag', (dragX) => {
        players[socket.id].dragX = dragX;

        // すべてのプレイヤーのドラッグ情報を基に中点を計算
        const totalDrag = Object.values(players).reduce((sum, player) => sum + player.dragX, 0);
        const playerCount = Object.keys(players).length;
        ropePosition = totalDrag / playerCount;

        // 綱の位置を全クライアントに送信
        io.emit('update', ropePosition);
    });

    // プレイヤーが切断された場合
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        delete players[socket.id];
    });
});

// サーバを起動
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});