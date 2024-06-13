// worker.js
require('dotenv').config();
const fetch = require('node-fetch');
const { parentPort } = require('worker_threads');
const { LMStudioClient } = require("@lmstudio/sdk");

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
    const client = new LMStudioClient();
    const model = await client.llm.load("lmstudio-community/Meta-Llama-3-8B-Instruct-GGUF");

    const messages = [
        { role: "system", content: "Always answer in rhymes." },
        { role: "user", content: data.content }
    ];

    try {
        let resultText = '';
        for await (const text of model.respond(messages)) {
            resultText += text;
        }
        console.log('Received result from server:', resultText);
        return { content: resultText };
    } catch (error) {
        console.error('Error during model prediction:', error);
        throw error; // Re-throw the error to be caught by the outer try-catch
    }
}