// client.js
var socket = io();
console.log('client socket initiated:', socket); // Log the initialized socket

function autoExpand(element) {
  element.style.height = 'inherit';
  const computed = window.getComputedStyle(element);
  const height = parseInt(computed.getPropertyValue('border-top-width'), 10)
               + parseInt(computed.getPropertyValue('border-bottom-width'), 10)
               + element.scrollHeight;
               
  element.style.height = height + 'px';
}

// Function to send a message to the server
function sendMessage(data) {
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
      inputs: inputs,
      parameters: parameters
  };
  // Send the data to the server
  socket.emit('query', data);

  // Update the user-message div
  document.getElementById('ai-reply').innerText = JSON.stringify(data);
}

socket.on('result', (result) => {
  const aiReply = document.getElementById('ai-reply');
  // Check if the result is text
  if (result.text) {
      aiReply.textContent = result.text;
  } else if (result.url) {
      // If the result is an image, set the src attribute of an img element
      const img = document.createElement('img');
      img.src = result.url;
      aiReply.appendChild(img);
  }
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