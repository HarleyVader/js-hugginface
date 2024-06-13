require('dotenv').config();
const { parentPort } = require('worker_threads');
const { LMStudioClient } = require("@lmstudio/sdk");

// Initialize LMStudioClient with the new baseUrl
const client = new LMStudioClient({
  baseUrl: "ws://192.168.0.178:1234/v1",
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

async function main() {
    // Create a client to connect to LM Studio, then load a model
    const client = new LMStudioClient({ 
        baseUrl: "ws://192.168.0.178:1234" 
    });
    const model = await client.llm.load("lmstudio-community/Meta-Llama-3-8B-Instruct-GGUF");
  
    // Predict!
    const prediction = model.respond([
      { role: "system", content: "You are a helpful AI assistant." },
      { role: "user", content: "What is the meaning of life?" },
    ]);
    for await (const text of prediction) {
      process.stdout.write(result);
    }
  }
  
  main();