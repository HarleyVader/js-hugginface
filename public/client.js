// client.js
var socket = io();

function autoExpand(element) {
  element.style.height = 'inherit';
  const computed = window.getComputedStyle(element);
  const height = parseInt(computed.getPropertyValue('border-top-width'), 10)
               + parseInt(computed.getPropertyValue('border-bottom-width'), 10)
               + element.scrollHeight;
               
  element.style.height = height + 'px';
}

// Function to send a message to the server
function sendMessage() {
  // Get the input element and its value
  const inputElement = document.getElementById('text');
  const inputs = inputElement.value;

  // Prepare the data to be sent
  const data = {
    inputs: inputs,
    // Add any additional parameters if needed
  };

  // Send the data to the server
  socket.emit('query', data);

  // Update the user-message div with the last prompt sent to the server
  const userMessage = document.getElementById('user-send');
  userMessage.textContent = inputs;
}

// Listen for AI responses from the server
socket.on('data', (data) => {
  // Get the container for the AI replies
  const aiReplyContainer = document.getElementById('ai-reply');

  // Create a new p element
  const newReply = document.createElement('p');

  // Set the text of the p element to the AI's reply
  // Assuming the AI response is directly in the data object
  newReply.textContent = data.text; // Adjusted to use data.text based on the worker's postMessage structure

  // Add the new p element to the container
  aiReplyContainer.appendChild(newReply);
});

// Get the form element and the send button
const form = document.getElementById('text-generation'); // Assuming there's an element with this ID for the form
const sendButton = document.getElementById('submit'); // Assuming the button has the ID 'submit'

// Add event listener for form submit
form.addEventListener('submit', function(event) {
  // Prevent the form from submitting normally
  event.preventDefault();

  // Call the sendMessage function
  sendMessage();
});

// Add event listener for the send button click (if not using form submit)
sendButton.addEventListener('click', function() {
  sendMessage();
});