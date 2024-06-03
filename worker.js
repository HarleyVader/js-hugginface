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
        "https://c5jmh0pkq7fg8o12.us-east-1.aws.endpoints.huggingface.cloud",
        {
            headers: { 
                "Accept" : "image/png",
                "Content-Type": "application/json" 
            },
            method: "POST",
            body: JSON.stringify({ inputs: message }), // Convert message to a JSON object
        }
    );
    console.log('Fetch finished');

    if (!response.ok) {
        console.log('Response status:', response.status);
        console.log('Response status text:', response.statusText);
        const errorText = await response.text();
        console.log('Error response body:', errorText);
    }

    const contentType = response.headers.get("content-type");
    const imageName = message.replace(/\s+/g, '-'); // Replace spaces with hyphens

    if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        console.log('Received result from query:', result);
        return result;
    } else if (contentType && contentType.includes("image/jpeg")) {
        const buffer = await response.buffer();
        fs.writeFileSync(path.join(__dirname, 'images', `${imageName}.jpg`), buffer);
        console.log(`Image saved as ${imageName}.jpg`);
        return { success: true, message: `${imageName}.jpg` };
    } else if (contentType && contentType.includes("image/png")) {
        const buffer = await response.buffer();
        fs.writeFileSync(path.join(__dirname, 'images', `${imageName}.png`), buffer);
        console.log(`Image saved as ${imageName}.png`);
        return { success: true, message: `${imageName}.png` };
    } else {
        throw new Error(`Unexpected content type: ${contentType || "unknown"}`);
    }
}