const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Worker } = require('worker_threads');

const app = express();
app.use(express.json());

// Serve static files from the public directory
app.use(express.static('public'));

const port = process.env.PORT || 6969;
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('a user connected');

  const worker = new Worker('./worker.js');

  worker.on('message', (result) => {
    socket.emit('result', result);
  });

  socket.on('message', (data) => {
    worker.postMessage(data);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});