//worker.js
require('dotenv').config();
const { parentPort } = require('worker_threads');
const { LMStudioClient } = require("@lmstudio/sdk");

// Initialize LMStudioClient without specifying baseUrl to use the default
const client = new LMStudioClient({
    baseUrl: "ws://192.168.0.178:1234",
  });

// Define the query function
async function query(message) {
    const model = await client.llm.load("Sao10K/Fimbulvetr-11B-v2-GGUF/Fimbulvetr-11B-v2.q4_K_S.gguf");
    
    // Use the model to respond to the user's message
    const prediction = model.respond([
      { role: "system", content: "You are a helpful AI assistant." },
      { role: "user", content: message.inputs },
    ]);
    
    // Iterate through the prediction to construct the full response
    let fullResponse = '';
    for await (const text of prediction) {
        fullResponse += text;
    }
    console.log('Result: ', fullResponse);
    console.log("message", message.inputs);
    // Return the full response
    return fullResponse;
}

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