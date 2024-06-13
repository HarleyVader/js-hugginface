require('dotenv').config();
const { parentPort } = require('worker_threads');
const { LMStudioClient } = require("@lmstudio/sdk");

// Initialize LMStudioClient with the new baseUrl
const client = new LMStudioClient({
  baseUrl: "ws://192.168.0.178:1234/v1/chat/completions",
});

// Define the query function
async function query(message) {
    // Assuming message contains the input for the model
    const model = await client.llm.load("Sao10K/Fimbulvetr-11B-v2-GGUF/Fimbulvetr-11B-v2.q4_K_S.gguf");
    const prediction = await model.respond([
      { role: "system", content: "You are a helpful AI assistant." },
      { role: "user", content: message.inputs }, // Use the message as input
    ]);
    let result = "";
    for await (const part of prediction) {
      result += part;
    }
    console.log('Result: ', result);
    return result;
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
