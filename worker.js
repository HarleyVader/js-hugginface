// worker.js
require('dotenv').config();
const fetch = require('node-fetch');
const { parentPort } = require('worker_threads');
const fs = require('fs');
const path = require('path');

console.log('Worker script started'); // Log when the worker script starts

parentPort.on('message', async (message) => {
    console.log('Received message from parent:', message); // Log the received message
    console.log('Starting query'); // Log before starting the query
    try {
        const result = await query(message);
        console.log('Query finished'); // Log after the query finishes
        console.log('Posting result to parent'); // Log before posting the result to the parent
        parentPort.postMessage(result);
        console.log('Posted result to parent', result); // Log after posting the result to the parent
    } catch (error) {
        console.error('Error during query:', error);
        parentPort.postMessage({ error: error.message });
    }
});

async function query(message) {
    console.log('Querying with message:', message);
    console.log('Starting fetch');
    const response = await fetch(
        "https://api-inference.huggingface.co/models/UnfilteredAI/NSFW-gen-v2.1",
        {
            headers: { Authorization: `Bearer ${process.env.TOKEN}` },
            method: "POST",
            body: message,
        }
    );
    console.log('Fetch finished');

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        console.log('Received result from query:', result);
        return result;
    } else if (contentType && contentType.includes("image/jpeg")) {
        const buffer = await response.buffer();
        fs.writeFileSync(path.join(__dirname, 'output.jpg'), buffer);
        console.log('Image saved as output.jpg');
        return { success: true, message: 'Image saved as output.jpg' };
    } else {
        throw new Error(`Unexpected content type: ${contentType || "unknown"}`);
    }
}