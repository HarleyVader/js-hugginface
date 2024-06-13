require('dotenv').config();
const fetch = require('node-fetch');
const { parentPort } = require('worker_threads');
const { LMStudioClient } = require("@lmstudio/sdk");

// Initialize LMStudioClient with the new baseUrl
const client = new LMStudioClient({
  baseUrl: "ws://192.168.0.178:1234",
});

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
    // Load a model with the new model identifier
    const llama3 = await client.llm.load("Sao10K/Fimbulvetr-11B-v2-GGUF", {
        config: {
            gpuOffload: "max",
        },
    });

    // Create a text completion prediction
    const prediction = llama3.complete(data.content);

    // Stream the response and construct the result object
    let resultText = '';
    for await (const text of prediction) {
        resultText += text;
    }

    console.log('Received result from server:', resultText);
    return { content: resultText };
}