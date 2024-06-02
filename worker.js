// worker.js
require('dotenv').config();
const fetch = require('node-fetch');
const { parentPort } = require('worker_threads');

console.log('Worker script started'); // Log when the worker script starts

parentPort.on('message', async (data) => {
    console.log('Received data from parent:', data); // Log the received data
    console.log('Starting query'); // Log before starting the query
    const result = await query(data);
    console.log('Query finished'); // Log after the query finishes
    console.log('Posting result to parent'); // Log before posting the result to the parent
    parentPort.postMessage(result);
    console.log('Posted result to parent'); // Log after posting the result to the parent
});

async function query(data) {
    console.log('Querying with data:', data); // Log the data being used to query
    console.log('Starting fetch'); // Log before starting the fetch
    const response = await fetch(
        "https://api-inference.huggingface.co/models/UnfilteredAI/NSFW-gen-v2.1",
        {
            headers: { Authorization: `Bearer ${process.env.TOKEN}` },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    console.log('Fetch finished'); // Log after the fetch finishes
    console.log('Starting response.blob()'); // Log before starting response.blob()
    const result = await response.blob();
    console.log('response.blob() finished'); // Log after response.blob() finishes
    console.log('Received result from query:', result); // Log the received result
    return result;
}