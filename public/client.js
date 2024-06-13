document.addEventListener('DOMContentLoaded', () => {
  const socket = io(); // Initialize socket.io client

  // Function to automatically expand the textarea to fit its content
  function autoExpand(element) {
    element.style.height = 'inherit';
    const computed = window.getComputedStyle(element);
    // Calculate the height
    const height = parseInt(computed.getPropertyValue('border-top-width'), 10) +
                   parseInt(computed.getPropertyValue('border-bottom-width'), 10) +
                   element.scrollHeight;
    element.style.height = height + 'px';
  }

  // Function to send a message to the server
  function sendMessage(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const textArea = document.getElementById('text');
    const data = textArea.value; // Get the value from the textarea

    // Send the data to the server
    socket.emit('query', { data });

    // Update the user-message div with the last prompt sent to the server
    const userSendDiv = document.getElementById('user-send');
    
    // Create a new p element
    const p = document.createElement("p");
    
    // Set the text of the p element to the data
    p.textContent = data; // Corrected from 'inputs' to 'data'
    
    // Append the p element to the userSendDiv
    userSendDiv.appendChild(p);

    // Clear the textarea after sending the message
    textArea.value = '';
  }

  // Attach the sendMessage function to the form's submit event
  document.getElementById('text-generation').addEventListener('submit', sendMessage);

  // Function to handle incoming messages from the server
  socket.on('message', (message) => {
    const outputElement = document.getElementById("ai-reply");
    const p = document.createElement("p");
    p.textContent = message.text; // Assuming message.text contains the text you want to append
    outputElement.appendChild(p);
  });
});