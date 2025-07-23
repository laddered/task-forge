// socket/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } }); // разрешить CORS для dev

// userId -> socket.id[]
const onlineUsers = new Map();

io.on('connection', (socket) => {
  // Получаем userId от клиента
  socket.on('login', ({ userId }) => {
    socket.userId = userId;
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, []);
    onlineUsers.get(userId).push(socket.id);
    // Оповестить всех о новом онлайн-юзере
    io.emit('user online', { userId });
  });

  socket.on('disconnect', () => {
    const userId = socket.userId;
    if (userId && onlineUsers.has(userId)) {
      // Удалить сокет из массива
      const arr = onlineUsers.get(userId).filter(id => id !== socket.id);
      if (arr.length === 0) {
        onlineUsers.delete(userId);
        io.emit('user offline', { userId });
      } else {
        onlineUsers.set(userId, arr);
      }
    }
    console.log('user disconnected');
  });

  // Сообщения — рассылаем только участникам
  socket.on('chat message', (msg) => {
    // msg: { senderId, receiverId, text, timestamp }
    // Отправить только отправителю и получателю
    [msg.senderId, msg.receiverId].forEach(uid => {
      const sockets = onlineUsers.get(uid) || [];
      sockets.forEach(sid => {
        io.to(sid).emit('chat message', msg);
      });
    });
  });

  // Индикатор «печатает»
  socket.on('typing', (data) => {
    // data: { from, to }
    const sockets = onlineUsers.get(data.to) || [];
    sockets.forEach(sid => {
      io.to(sid).emit('typing', data);
    });
  });
});

server.listen(4000, () => {
  console.log('listening on *:4000');
});