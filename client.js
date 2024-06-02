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
  var preprompt = document.getElementById('preprompt').value;

  if (message.trim() !== '') {
    // Emit the message to the server
    socket.emit('message', { prompt: message });

    // Update the user-message div
    document.getElementById('user-message').innerText = message;
  }

  // Clear input fields after sending
  document.getElementById('message').value = '';
  document.getElementById('preprompt').value = '';
}

// Function to show preprompt to the user
function showPreprompt() {
  // Attach showPreprompt function to the showPreprompt button
  document.getElementById('ai-preprompt').onclick = showPreprompt;
}

// Listen for result events from the server
socket.on('result', function(result) {
  var node = document.createElement('p');
  var textnode = document.createTextNode(result);
  node.appendChild(textnode);
  document.getElementById('ai-reply').appendChild(node);
  lastReply = result; // Store the last reply
});

document.getElementById('set').addEventListener('click', function() {
  const preprompt = document.getElementById('preprompt').value;
  socket.emit('set preprompt', { preprompt });

  // Update the ai-preprompt div
  document.getElementById('ai-preprompt').innerText = preprompt;
});

// Attach the sendMessage function to the send button
document.getElementById('send').onclick = sendMessage;

// Attach showPreprompt function to the showPreprompt button
document.getElementById('ai-preprompt').onclick = showPreprompt;

// Attach sendMessage function to the enter key
document.getElementById('message').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// Optional: Store the last reply for continuity
let lastReply = '';