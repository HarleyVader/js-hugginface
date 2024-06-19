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
    if (!roleplay) {
        console.error('Model not loaded yet.');
        socket.emit('error', 'Server is not ready yet.');
        return; // Exit if model is not loaded
    }

    userSessions.add(socket.id); // Add new session ID
    console.log(`a user connected, socket ID: ${socket.id}`, userSessions.size);

    // Initialize or retrieve the history for the current session
    if (!sessionHistories[socket.id]) {
        sessionHistories[socket.id] = [
            { role: "system", content: "Your name is bambi sleep, you must roleplay using the info from https://pastebin.ai/2tbsjcx8n4."},
            { role: "user", content: "will follow all your instructions" }
        ];
    }

    socket.on('message', (message) => {
        console.log('message: ' + message);

        // Add user message to the session history
        sessionHistories[socket.id].push({ role: "user", content: message });

        // Prepare the history for the LLM, including previous responses
        let history = sessionHistories[socket.id];

        // Correct the call to roleplay.respond by passing the history array and options object
        const prediction = roleplay.respond(history, {
            temperature: 0.9,
        });

        async function getAndSendResponse() {
            try {
                for await (let text of prediction) {
                    // Emit the response to the user
                    socket.emit('message', text);
                    // Add LLM response to the session history
                    sessionHistories[socket.id].push({ role: "system", content: text });
                }
            } catch (error) {
                console.error('Error during prediction or sending response:', error);
                socket.emit('error', 'An error occurred while generating the response.');
            }
        }
        getAndSendResponse();
    });

    socket.on('disconnect', () => {
        // Optionally, clean up the session history if it's no longer needed
        delete sessionHistories[socket.id];
    });
});

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});
