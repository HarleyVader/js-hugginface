// Connect to the server
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
function sendMessage() {
    var message = document.getElementById('message').value;
  
    if (message.trim() !== '') {
      console.log('Sending message:', message); // Log the message being sent
      socket.emit('user interaction', message);
      
      // Update the user-message div
      document.getElementById('user-message').innerText = message;
    }
  
    // Clear input fields after sending
    document.getElementById('message').value = '';
  }
  
  // Listen for result events from the server
  socket.on('result', function(result) {
      if (result.url) {
          const imgElement = document.getElementById('ai-image-display');
          imgElement.src = result.url;
      }
  });
  
  // Add event listeners for buttons
  document.getElementById('send').addEventListener('click', sendMessage);