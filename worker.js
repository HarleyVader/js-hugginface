// worker.js
require('dotenv').config();
const fetch = require('node-fetch');
const { parentPort } = require('worker_threads');

parentPort.on('message', async (data) => {
    console.log('Received data from parent:', data); // Log the received data
    const result = await query(data);
    parentPort.postMessage(result);
});

async function query(data) {
    console.log('Querying with data:', data); // Log the data being used to query
    const response = await fetch(
        "https://api-inference.huggingface.co/models/UnfilteredAI/NSFW-gen-v2.1",
        {
            headers: { Authorization: `Bearer ${process.env.TOKEN}` },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.blob();
    console.log('Received result from query:', result); // Log the received result
    return result;
}
