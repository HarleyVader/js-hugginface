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
      llama3 = await client.llm.load("fhai50032/RolePlayLake-7B-GGUF/roleplaylake-7b.Q5_K_M.gguf", {
        config: { gpuOffload: "max" },
        noHup: true,
      });
      
        console.log('Model loaded successfully');
    }
    catch (error) {
        console.error('Error during model loading:', error);
        throw error;
    }
}


// Define the query function
async function query(input) {
    try {
        // Ensure the model is loaded
        if (!llama3) {
            throw new Error("Model not loaded");
        }

        // Use the model to generate a response based on the input
        const prediction = llama3.complete(input);
        let responseText = '';

        // Stream the response
        for await (const text of prediction) {
            responseText += text;
        }

        return { data: responseText };
    } catch (error) {
        console.error('Error during model query:', error);
        throw error; // Rethrow the error to be caught in the parentPort.on message handler
    }
}

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

main();