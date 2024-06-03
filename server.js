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

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve images from the "images" directory
app.use('/images', express.static(path.join(__dirname, 'images')));

io.on('connection', (socket) => {
    console.log(`New client connected with socket ID: ${socket.id}`); // Log the socket id

    const worker = new Worker('./worker.js');

    worker.on('message', (result) => {
        // If the result is an image, generate a URL for it
        if (result.message.endsWith('.jpg') || result.message.endsWith('.png')) {
            result.url = `https://bambisleep.chat/images/${result.message}`;
        }

        socket.emit('result', result);
    });

    socket.on('message', (message) => {
        console.log(`Received message from client with socket ID ${socket.id}:`, message);
        console.log(`User prompt: ${message}`); // Log the user prompt
        worker.postMessage(message);
    });

    socket.on('disconnect', () => {
        worker.terminate();
    });
});

server.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
});