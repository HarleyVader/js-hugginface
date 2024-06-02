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
  var message = document.getElementById('message').value;

  if (message.trim() !== '') {
    // Emit the message to the server
    socket.emit('message', { prompt: message });

    // Update the user-message div
    document.getElementById('user-message').innerText = message;
  }

  // Clear input fields after sending
  document.getElementById('message').value = '';
}

socket.on('result', function(result) {
  console.log('Received result:', result); // Log the received result

  var node = document.createElement('img');
  
  var url = URL.createObjectURL(result);
  console.log('Converted result:', url); // Log converted result
  node.src = url;

  document.getElementById('ai-reply').appendChild(node);
  lastReply = result;
});

// Attach the sendMessage function to the send button
document.getElementById('send').onclick = sendMessage;

// Attach sendMessage function to the enter key
document.getElementById('message').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// Optional: Store the last reply for continuity
let lastReply = '';