// worker.js
require('dotenv').config();
const fetch = require('node-fetch'); // Ensure this is used if necessary, else remove
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
    const client = OpenAI(base_url="http://192.168.0.178:1234/v1", api_key="lm-studio")
    const model = await client.llm.load("Sao10K/Fimbulvetr-11B-v2-GGUF");

    // Adjusted to match the structure from the provided index.js
    const messages = [
        { role: "system", content: "You are a helpful AI assistant." },
        { role: "user", content: data.content } // Assuming data.content is the user's query
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