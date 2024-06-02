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
    socketId = socket.id;
    console.log(`New client connected with socket ID: ${socketId}`); // Log the socket id

    socket.on('user interaction', (data) => {
        if (worker) {
            worker.postMessage(data);
        }
    });
});

worker.on('message', (result) => {
    io.to(socketId).emit('result', result);
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

server.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
});