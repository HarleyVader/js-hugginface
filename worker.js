const { parentPort } = require('worker_threads');
const fetch = require('node-fetch');

let connectedUsers = 0;
let lastActivity = Date.now();

async function query(data) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/UnfilteredAI/NSFW-gen-v2.1",
    {
      headers: { Authorization: "Bearer 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" },
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  const result = await response.blob();
  return result;
}

parentPort.on('message', async (data) => {
  connectedUsers++;
  lastActivity = Date.now();
  const result = await query(data);
  parentPort.postMessage(result);
  connectedUsers--;
  console.log(`Connected users: ${connectedUsers}`);
});

setInterval(() => {
  if (connectedUsers === 0 && Date.now() - lastActivity > 5 * 60 * 1000) {
    console.log('No activity for 5 minutes, shutting down...');
    process.exit();
  }
}, 60 * 1000);