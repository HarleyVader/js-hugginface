// Import the necessary libraries
const { LMStudioClient } = require('@lmstudio/sdk');
const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs').promises;
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = 6969;

// Serve static files from the 'public' directory
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
        gpuOffload: 0.9,
        context_length: 32768,
        embedding_length: 8176,
    },
}).then(model => {
    roleplay = model;
}).catch(error => {
    console.error('Error loading the model:', error);
});

let userMessages = []; // Step 1: Declare the array to store messages

let userSessions = new Set(); // Use a Set to track unique user sessions

io.on('connection', (socket) => {
    userSessions.add(socket.id); // Add new session ID
    console.log(`a user connected, socket ID: ${socket.id}`, userSessions.size);

    socket.on('message', (message) => {
        console.log('message: ' + message);

        userMessages.unshift(message);
        if (userMessages.length > 10) {
            userMessages.pop();
        }

        let concatenatedMessages = userMessages.slice().reverse().join(' ');
        let allMessages = concatenatedMessages.length > 8000 ? concatenatedMessages.substring(0, 8000) : concatenatedMessages;

        let prediction = roleplay.complete(allMessages, { 
            temperature: 0.1,
        });

        async function getAndSendResponse() {
            try {
                for await (let text of prediction) {
                    socket.emit('message', text);
                }
            } catch (error) {
                console.error('Error during prediction or sending response:', error);
                socket.emit('error', 'An error occurred while generating the response.');
            }
        }
        getAndSendResponse();
        concatenatedMessages = ''; // Clear the concatenated messages
    });

    socket.on('disconnect', () => {
        userMessages = []; // Clear the messages on disconnect
        userSessions.delete(socket.id); // Remove session ID on disconnect
        console.log(`user disconnected, socket ID: ${socket.id}`, userSessions.size);
        
    });
});

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});
