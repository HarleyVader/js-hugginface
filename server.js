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

app.get('/images', async (req, res) => {
    const directoryPath = path.join(__dirname, 'images');
    const files = await fs.readdir(directoryPath);
    let html = '<html><body>';
    files.forEach(file => {
        if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
            html += `<img src="/images/${file}" width="64" height="64" />`;
        }
    });
    html += '</body></html>';
    res.send(html);
});

io.on('connection', (socket) => {
    console.log(`New client connected with socket ID: ${socket.id}`); // Log the socket id

    const worker = new Worker('./worker.js');

    socket.on('query', (data) => {
        console.log(`Received prompt from client with socket ID ${socket.id}: ${data.inputs}`);
        console.log(`Received parameters from client with socket ID ${socket.id}:`, data.parameters);
        worker.postMessage(data);
    });

    worker.on('message', (data) => {
        // Check if result and result.message are defined
        if (data && data.message) {
            // If the result is an image, generate a URL for it
            if (data.message.endsWith('.png')) {
                const imageName = data.message;
                data.url = `https://bambisleep.chat/images/${imageName}`;
            } else {
                // If the result is text, just send it as is
                data.text = data.message;
            }
        }
    
        // Emit the result to the client
        socket.emit('data', data);
    });

    socket.on('disconnect', () => {
        worker.terminate();
    });
});

server.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
});