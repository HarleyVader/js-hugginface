// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Worker } = require('worker_threads');
const path = require('path');
const fs = require('fs').promises;

const PORT = 6969;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve images from the "images" directory
app.use('/images', express.static(path.join(__dirname, 'images')));

io.on('connection', (socket) => {
    console.log(`New client connected with socket ID: ${socket.id}`); // Log the socket id

    const worker = new Worker('./worker.js');

    socket.on('user interaction', (data) => {
        console.log(`Received prompt from client with socket ID ${socket.id}: ${data.prompt}`);
        worker.postMessage(data);
    });

    worker.on('message', (result) => {
        // If the result is an image, generate a URL for it
        if (result.message.endsWith('.png')) {
            const imageName = result.message;
            result.url = `https://bambisleep.chat/images/${imageName}`;
        }

        socket.emit('result', result);
    });

    socket.on('disconnect', () => {
        worker.terminate();
    });
});

server.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
});