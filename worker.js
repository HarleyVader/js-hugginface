// worker.js
require('dotenv').config();
const fetch = require('node-fetch');
const { parentPort } = require('worker_threads');

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
    const response = await fetch("http://localhost:6969/v1/embeddings", {
        headers: { 
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
            model: "Sao10K/Fimbulvetr-11B-v2-GGUF",
            messages: [ 
                { role: "system", content: "Always answer in rhymes." },
                { role: "user", content: data.content }
            ], 
            temperature: 0.7, 
            max_tokens: -1,
            stream: true
        }),
    });

    // Clone the response for safekeeping in case JSON parsing fails
    const clonedResponse = response.clone();

    try {
        const result = await response.json();
        console.log('Received result from server:', result);
        return result;
    } catch (error) {
        try {
            // Attempt to read the cloned response as text for debugging
            const text = await clonedResponse.text();
            console.error('Failed to parse JSON, raw response:', text);
        } catch (textError) {
            console.error('Failed to read response text:', textError);
        }
        throw error; // Re-throw the original error after logging
    }
}