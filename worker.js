// worker.js
require('dotenv').config();
const fetch = require('node-fetch');
const { parentPort } = require('worker_threads');

parentPort.on('message', async (message) => {
    console.log('Received data from server:', message);
    try {
        const result = await query(message);
        parentPort.postMessage(result);
    } catch (error) {
        console.error('Error during query:', error);
        parentPort.postMessage({ error: error.message });
    }
});

async function query(data) {
    const response = await fetch(
        "http://localhost:6969/v1/chat/completions",
        {
            headers: { 
                "Content-Type": "application/json",
                "api_key": "lm-studio" // Assuming api_key should be in headers
            },
            method: "POST",
            body: JSON.stringify({
                model: "Sao10K/Fimbulvetr-11B-v2-GGUF",
                messages: [ 
                    { role: "system", content: "Always answer in rhymes." },
                    { role: "user", content: data.content } // Assuming data.content contains the user's message
                ], 
                temperature: 0.7, 
                max_tokens: -1,
                stream: true
            }),
        }
    );
    const result = await response.json();
    console.log('Received result from server:', result);
    return result;
}