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
        "http://localhost:6969/v1",
        {
            headers: { 
                "Accept" : "application/json",
                "Content-Type": "application/json" 
            },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();
    console.log('Received result from Hugging Face:', result);
    return result;
}