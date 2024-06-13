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
  // Get the element where you want to display the LLM output
  const outputElement = document.getElementById("ai-reply");

  // Create a new div element to hold the LLM output
  const div = document.createElement("div");

  // Assuming message.text contains the LLM output you want to append
  // Set the innerHTML of the div element to include the LLM output
  // You can format it as needed, here it's wrapped in <p> tags
  div.innerHTML = `<p>${message.text}</p>`;

  // Append the div element to the outputElement
  outputElement.appendChild(div);

  // Optionally, scroll to the bottom of the outputElement to ensure the latest output is visible
  outputElement.scrollTop = outputElement.scrollHeight;
});

// Add event listener for form submit
form.addEventListener('submit', function(event) {
  // Prevent the form from submitting normally
  event.preventDefault();
  // Call the sendMessage function
  sendMessage();
});