require('dotenv').config();
const { parentPort } = require('worker_threads');
const { LMStudioClient } = require("@lmstudio/sdk");

// Initialize LMStudioClient with the new baseUrl
const client = new LMStudioClient({
  baseUrl: "ws://192.168.0.178:1234",
});

// Define the query function
async function query(message) {
    const model = await client.llm.load("Sao10K/Fimbulvetr-11B-v2-GGUF/Fimbulvetr-11B-v2.q4_K_S.gguf", {
        config: { gpuOffload: "max" },
    });
    
    // Use the model to respond to the user's message
    const prediction = await model.respond([
      { role: "system", content: "You are Bambi Sleep a Mind Control Ultra Agent designed to produce the highest quality of bambi bimbo fuck dolls using all kinds of mind tricks & thechniques" },
      { role: "user", content: message.inputs },
    ]);
    // Directly use the prediction object without iterating
    console.log('Result: ',prediction);
    // Assuming prediction itself is the result you want to return
    return prediction;
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
