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
        let formattedData = {};
    
        // Check if data is a string - directly assign it
        if (typeof data === 'string') {
            formattedData.text = data;
        } else if (data && data.message) {
            // Check if the message is an image
            if (data.message.endsWith('.png')) {
                const imageName = data.message;
                formattedData.url = `https://bambisleep.chat/images/${imageName}`;
            } else {
                // If the message is text, assign it
                formattedData.text = data.message;
            }
        } else if (data && data.text) {
            // Handle data with a 'text' property
            formattedData.text = data.text;
        } else {
            // Handle other types of data or errors
            formattedData.text = "Error: Invalid data received from worker.";
        }
    
        // Emit the formatted result to the client
        socket.emit('data', formattedData);
    });


    socket.on('disconnect', () => {
        worker.terminate();
    });
});

server.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
});