// worker.js
require('dotenv').config();
const fetch = require('node-fetch');
const { parentPort } = require('worker_threads');
const fs = require('fs');
const path = require('path');

parentPort.on('message', async (message) => {
    try {
        const result = await query(message);
        parentPort.postMessage(result);
    } catch (error) {
        console.error('Error during query:', error);
        parentPort.postMessage({ error: error.message });
    }
});

async function query(message) {
    const response = await fetch(
        //"https://c5jmh0pkq7fg8o12.us-east-1.aws.endpoints.huggingface.cloud",
        "https://iozeoebazkwbd9nv.us-east-1.aws.endpoints.huggingface.cloud",
        {
            headers: { 
                "Accept" : "image/png",
                "Content-Type": "application/json" 
            },
            method: "POST",
            body: JSON.stringify({ inputs: message }),
        }
    );

    if (!response.ok) {
        console.error('Response status:', response.status);
        console.error('Response status text:', response.statusText);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
    }

    const contentType = response.headers.get("content-type");
    const imageName = message.replace(/\W+/g, '-');

    if (contentType && contentType.includes("image/png")) {
        const buffer = await response.buffer();
        fs.writeFileSync(path.join(__dirname, 'images', `${imageName}.png`), buffer);
        return { success: true, message: `${imageName}.png` };
    } else {
        throw new Error(`Unexpected content type: ${contentType || "unknown"}`);
    }
}