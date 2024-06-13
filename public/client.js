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
  // Get the values from the form fields
  const top_k = document.getElementById('top_k').value;
  const top_p = document.getElementById('top_p').value;
  const temperature = document.getElementById('temperature').value;
  const max_new_tokens = document.getElementById('max_new_tokens').value;

  // Create the parameters object
  const parameters = {
      top_k: parseInt(top_k),
      top_p: parseFloat(top_p),
      temperature: parseFloat(temperature),
      max_new_tokens: parseInt(max_new_tokens)
  };

  // Get the textarea element
  const textArea = document.getElementById('text');

  // Get the value of the textarea
  const inputs = textArea.value;

  const data = {
      inputs: inputs
      //parameters: parameters
  };
  // Send the data to the server
  socket.emit('query', data);

  // Update the user-message div with the last prompt sent to the server
  const userMessage = document.getElementById('user-send');
  userMessage.textContent = inputs;
}

socket.on('data', (data) => {
  // Get the container for the AI replies
  const aiReplyContainer = document.getElementById('ai-reply');

  // Create a new p element
  const newReply = document.createElement('p');

  // Set the text of the p element to the AI's reply
  newReply.textContent = prediction;

  // Add the new p element to the container
  aiReplyContainer.appendChild(newReply);
});

// Get the form element
const form = document.getElementById('text-generation');

// Add event listener for form submit
form.addEventListener('submit', function(event) {
  // Prevent the form from submitting normally
  event.preventDefault();

  // Call the sendMessage function
  sendMessage();
});