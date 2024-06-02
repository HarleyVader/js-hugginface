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
    console.log('Client connected'); // Log when a client connects
    socketId = socket.id; // Store the socket id
    console.log(`Socket ID: ${socketId}`); // Log the socket id

    socket.on('user interaction', (data) => {
        console.log('Received user interaction:', data); // Log the received data
        if (worker) {
            console.log('Sending data to worker'); // Log before sending data to worker
            worker.postMessage(data);
        } else {
            console.log('Worker not initialized'); // Log if worker is not initialized
        }
    });
});

worker.on('message', (result) => {
    console.log('Received result from worker:', result); // Log the received result
    io.to(socketId).emit('result', result); // Send the result to the specific client
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

server.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
});
