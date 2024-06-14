// Import the necessary libraries
const { LMStudioClient } = require('@lmstudio/sdk');
const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = 6969;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize the LMStudio SDK
const client = new LMStudioClient({
    baseUrl: 'ws://192.168.0.178:1234', // Replace with your LMStudio server address
});

// Initialize a WebSocket connection to the LMStudio server
const ws = new WebSocket('ws://192.168.0.178:1234'); // Replace with your LMStudio server address

ws.on('open', function open() {
    console.log('connected');
});

ws.on('close', function close() {
    console.log('disconnected');
});

// Load a model
let roleplay;
client.llm.load('Ttimofeyka/MistralRP-Noromaid-NSFW-Mistral-7B-GGUF/MistralRP-Noromaid-NSFW-7B-Q4_0.gguf', {
    config: {
        gpuOffload: 'max'
    },
}).then(model => {
    roleplay = model;
});



io.on('connection', (socket) => {
    console.log('a user connected');

    // Listen for a 'message' event from the client
    socket.on('message', (message) => {
        console.log('message: ' + message);

        // Use the loaded model to generate a response
        const prediction = roleplay.complete(message);

        // Since we can't use for await inside of socket.on, 
        // we'll create a separate async function and call it.
        async function getAndSendResponse() {
            for await (const text of prediction) {
                socket.emit('message', text);
            }
        }

        // Call the async function
        getAndSendResponse();
    });
});

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});
