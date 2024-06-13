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
  // Get the textarea element
  const textArea = document.getElementById('text');

  // Get the value of the textarea
  const inputs = textArea.value;

  const data = {
      inputs: inputs,
  };
  // Send the data to the server
  socket.emit('query', data);

  // Update the user-message div with the last prompt sent to the server
  const userMessage = document.getElementById('user-send');
  userMessage.textContent += inputs;
}

socket.on('message', (message) => {
  // Get the element where you want to display the output
  const outputElement = document.getElementById("ai-reply");

  // Create a new p element
  const p = document.createElement("p");

  // Assuming message.text contains the text you want to append
  // Set the text of the p element
  p.textContent = message.text;

  // Append the p element to the outputElement
  outputElement.appendChild(p);
});

// Add event listener for form submit
form.addEventListener('submit', function(event) {
  // Prevent the form from submitting normally
  event.preventDefault();
  // Call the sendMessage function
  sendMessage();
});