// Establishing connection with the server
const socket = io();

// Function to automatically adjust the height of a textarea
function autoExpand(element) {
  element.style.height = 'inherit';
  // Calculate the height
  const computed = window.getComputedStyle(element);
  const height = parseInt(computed.getPropertyValue('border-top-width'), 10)
               + parseInt(computed.getPropertyValue('border-bottom-width'), 10)
               + element.scrollHeight;
  element.style.height = `${height}px`;
}

// Function to handle form submission and send message to the server
function sendMessage() {
  // Extracting values from form fields
  const top_k = document.getElementById('top_k').value;
  const top_p = document.getElementById('top_p').value;
  const temperature = document.getElementById('temperature').value;
  const max_new_tokens = document.getElementById('max_new_tokens').value;

  // Constructing parameters object
  const parameters = {
    top_k: parseInt(top_k, 10),
    top_p: parseFloat(top_p),
    temperature: parseFloat(temperature),
    max_new_tokens: parseInt(max_new_tokens, 10)
  };

  // Extracting input text
  const textArea = document.getElementById('text');
  const inputs = textArea.value;

  // Constructing data object to send
  const data = {
    inputs: inputs,
    parameters: parameters
  };

  // Emitting data to the server
  socket.emit('query', data);

  // Updating UI with the user's message
  const userMessage = document.getElementById('user-send');
  userMessage.textContent = inputs;
}

// Listening for data event to receive response from the server
socket.on('data', (data) => {
  // Accessing the container for AI replies
  const aiReplyContainer = document.getElementById('ai-reply');

  // Creating a new paragraph element for each reply
  data.forEach(reply => {
    const newReply = document.createElement('p');
    newReply.className = 'result'; // Set the class name here
    newReply.textContent = reply.content; // Assuming reply has a content property
    aiReplyContainer.appendChild(newReply);
  });
});
// Handling form submission
document.getElementById('text-generation').addEventListener('submit', function(event) {
  event.preventDefault(); // Preventing default form submission
  sendMessage(); // Sending the message
});