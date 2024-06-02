// Connect to the server
var socket = io();
console.log('Socket initialized:', socket); // Log the initialized socket

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
  var message = document.getElementById('message').value;
  var image = document.getElementById('image').value;

  if (message.trim() !== '') {
    console.log('Sending message:', message, 'with image:', image); // Log the message and image being sent
    socket.emit('chat message', { message, image });
    
    // Update the user-message div
    document.getElementById('user-message').innerText = message;
  }

  // Clear input fields after sending
  document.getElementById('message').value = '';
  document.getElementById('image').value = '';
}

// Function to set image
function setImage() {
  var image = document.getElementById('image').value;
  console.log('Setting image:', image); // Log the image being set
  document.getElementById('ai-image').innerText = image;
}

// Listen for chat error events from the server
socket.on('chat error', function(err) {
  console.log('Received chat error:', err); // Log the received error
  var node = document.createElement('p');
  var textnode = document.createTextNode('Error: ' + err);
  node.style.color = 'red';
});

// Listen for chat message events from the server
socket.on('chat message', function(msg) {
  console.log('Received chat message:', msg); // Log the received message
});

// Add event listeners for buttons
document.getElementById('send').addEventListener('click', sendMessage);
document.getElementById('set').addEventListener('click', setImage);