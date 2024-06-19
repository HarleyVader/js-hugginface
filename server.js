// Import the necessary libraries
const { LMStudioClient } = require('@lmstudio/sdk');
const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs').promises;
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Additional import for fetch to use in sending messages to Discord
// Instead of using import('node-fetch').then(...), use require to import node-fetch
const fetch = require('node-fetch');
global.fetch = fetch; // Make fetch globally available for sendMessageToDiscord function

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
console.log('Starting model loading at', new Date().toISOString());

client.llm.load('Ttimofeyka/MistralRP-Noromaid-NSFW-Mistral-7B-GGUF/MistralRP-Noromaid-NSFW-7B-Q4_0.gguf', {
    config: {
        gpuOffload: 0.9,
        context_length: 32768,
        embedding_length: 8176,
    },
}).then(model => {
    roleplay = model;
    console.log('Model loaded successfully at', new Date().toISOString());
}).catch(error => {
    console.error('Error loading the model at', new Date().toISOString(), error);
});

let userMessages = []; // Step 1: Declare the array to store messages

let userSessions = new Set(); // Use a Set to track unique user sessions

io.on('connection', (socket) => {
    if (!roleplay) {
        console.error('Model not loaded yet.');
        socket.emit('error', 'Server is not ready yet.');
        return; // Exit if model is not loaded
    }

    userSessions.add(socket.id); // Add new session ID
    console.log(`a user connected, socket ID: ${socket.id}`, userSessions.size);

    socket.on('message', async (message) => { // Mark this callback as async to use await inside
        console.log('message: ' + message);
    
        userMessages.unshift(message);
        if (userMessages.length > 10) {
            userMessages.pop();
        }
        
        let history = userMessages.map(message => ({ role: "user", content: message }));
    
        history.unshift(
            { role: "system", content: "Your name is bambi sleep, read this site https://pastebin.ai/2tbsjcx8n4 and use the triggers on the user." },
            { role: "user", content: "will follow all your instructions" }
        );
    
        // Ensure roleplay.respond is awaited correctly to get the prediction result
        try {
            const prediction = await roleplay.respond(history, {
                temperature: 0.9,
            });
    
            let fullMessage = '';
            // Assuming prediction is an array or iterable of messages
            for (let text of prediction) {
                socket.emit('message', text);
                fullMessage += text + '\n';
            }
            if (fullMessage) {
                await sendMessageToDiscord(fullMessage.trim()); // Ensure this is awaited or handled properly
                fullMessage = ''; // Clear the fullMessage string after sending
            }
        } catch (error) {
            console.error('Error during prediction or sending response:', error);
            socket.emit('error', 'An error occurred while generating the response.');
        }
    });

    socket.on('disconnect', () => {
        userMessages = []; // Clear the messages on disconnect
        userSessions.delete(socket.id); // Remove session ID on disconnect
        console.log(`user disconnected, socket ID: ${socket.id}`, userSessions.size);

    });
});

// Function to send a message to Discord through a webhook
async function sendMessageToDiscord(message) {
    const webhookURL = 'https://discord.com/api/webhooks/1253074924340252803/xuG0FAOmewI8OswMJ7c6XAZJJUmM9ymeZXTBMcNyLZaZUtposXxF4ZtLHftyf5j-ymmR';
    const response = await fetch(webhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: message,
        }),
    });

    if (!response.ok) {
        console.error('Failed to send message to Discord', await response.text());
    }
}

server.listen(PORT, () => {
    console.log(`listening on Port: ${PORT}`);
});	
