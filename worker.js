//worker.js
require('dotenv').config();
const { parentPort } = require('worker_threads');
const { LMStudioClient } = require('@lmstudio/sdk');

let llama3; // Declare llama3 outside to make it accessible in the query function

async function main() {
    try {
      // Configure LMStudioClient to use the remote server
      const client = new LMStudioClient({
        baseUrl: 'ws://192.168.0.178:1234'
      });
  
      // Load a model
      llama3 = await client.llm.get("fhai50032/RolePlayLake-7B-GGUF/roleplaylake-7b.Q5_K_M.gguf", {
        config: { gpuOffload: "max" },
        noHup: true,
      });
  
      // Create a text completion prediction
      const prediction = llama3.complete(input);
  
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
        // Assuming message.data contains the text to be processed
        const result = await query(message.data);
        parentPort.postMessage(result);
    } catch (error) {
        console.error('Error during query:', error);
        parentPort.postMessage({ error: error.message });
    }
});