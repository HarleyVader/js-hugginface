// client.js
var socket = io();
console.log('Socket initialized:', socket); // Log the initialized socket

function autoExpand(element) {
  console.log('Expanding element:', element); // Log the element being expanded
  element.style.height = 'inherit';
  const computed = window.getComputedStyle(element);
  console.log('Computed styles:', computed); // Log the computed styles
  const height = parseInt(computed.getPropertyValue('border-top-width'), 10)
               + parseInt(computed.getPropertyValue('border-bottom-width'), 10)
               + element.scrollHeight;
  console.log('Calculated height:', height); // Log the calculated height
               
  element.style.height = height + 'px';
  console.log('Element height set to:', element.style.height); // Log the set height
}

socket.on('result', function(result) {
    console.log('Received result:', result); // Log the received result

    var node = document.createElement('img');
    console.log('Created img node:', node); // Log the created img node

    // Convert the result to a Blob if it's a base64-encoded string
    if (typeof result === 'string' && result.startsWith('data:image')) {
        console.log('Result is a base64-encoded string'); // Log that the result is a base64-encoded string
        fetch(result)
            .then(res => {
                console.log('Fetched result:', res); // Log the fetched result
                return res.blob();
            })
            .then(blob => {
                console.log('Converted result to blob:', blob); // Log the converted blob
                var url = URL.createObjectURL(blob);
                console.log('Converted result:', url); // Log converted result
                node.src = url;
                console.log('Set node src to:', node.src); // Log the set node src
            });
    }
});
// client.js
socket.on('connect', function() {
  console.log('Connected to server'); // Log when connected to server
});

socket.emit('user interaction', data); // Emit 'user interaction' event
console.log('Emitted user interaction:', data); // Log the emitted data