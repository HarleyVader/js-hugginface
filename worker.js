//worker.js
require('dotenv').config();
const { parentPort } = require('worker_threads');
const { LMStudioClient } = require('@lmstudio/sdk');

async function main() {
  try {
    const client = new LMStudioClient();

    // Load a model
    const llama3 = await client.llm.load("Sao10K/Fimbulvetr-11B-v2-GGUF/Fimbulvetr-11B-v2.q4_K_S.gguf", {
      config: { gpuOffload: "max" },
    });

    // Create a text completion prediction
    const prediction = llama3.complete("The meaning of life is");

    // Stream the response
    for await (const text of prediction) {
      process.stdout.write(text);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();

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