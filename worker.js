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
    const response = await fetch("http://localhost:6969/v1/chat/completions", {
        headers: { 
            "Content-Type": "application/json",
            "api_key": "lm-studio" // Ensure this is the correct way to pass the API key
        },
        method: "POST",
        body: JSON.stringify({
            model: "Sao10K/Fimbulvetr-11B-v2-GGUF",
            messages: [ 
                { role: "system", content: "Always answer in rhymes." },
                { role: "user", content: data.content }
            ], 
            temperature: 0.7, 
            max_tokens: -1,
            stream: true
        }),
    });

    try {
        const result = await response.json();
        console.log('Received result from server:', result);
        return result;
    } catch (error) {
        // Log raw response text for debugging
        const text = await response.text();
        console.error('Failed to parse JSON, raw response:', text);
        throw error; // Re-throw the error after logging
    }
}