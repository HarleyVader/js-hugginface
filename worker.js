// worker.js
require('dotenv').config();
const fetch = require('node-fetch');
const { parentPort } = require('worker_threads');

parentPort.on('message', async (data) => {
    const result = await query(data);
    parentPort.postMessage(result);
});

async function query(data) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/UnfilteredAI/NSFW-gen-v2.1",
        {
            headers: { Authorization: `Bearer ${process.env.TOKEN}` },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.blob();
    return result;
}