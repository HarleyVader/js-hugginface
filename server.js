// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Worker } = require('worker_threads');
const path = require('path');

const PORT = 6969;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const worker = new Worker('./worker.js');

let socketId;

io.on('connection', (socket) => {
    socketId = socket.id; // Store the socket id

    socket.on('user interaction', (data) => {
        worker.postMessage(data);
    });
});

worker.on('message', (result) => {
    io.to(socketId).emit('result', result); // Send the result to the specific client
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

server.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
});