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
        // If the result is a .png image, generate a URL for it
        if (result.imageName && result.imageName.endsWith('.png')) {
            result.url = `https://bambisleep.chat/images/${result.imageName}`;
        }
    
        socket.emit('result', result);
    });

    // Listen for 'user interaction' events instead of 'message' events
    socket.on('user interaction', (message) => {
        console.log(`Received message from client with socket ID ${socket.id}:`, message);
        console.log(`User prompt: ${message}`); // Log the user prompt
        worker.postMessage(message);
    });
    
    socket.on('log', (message) => {
        console.log(`Log from client with socket ID ${socket.id}:`, message);
    });
    
    socket.on('disconnect', () => {
        worker.terminate();
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});