const socket = io('http://localhost:3000'); // Connect to the Socket.IO server

document.getElementById('sendButton').addEventListener('click', () => {
    socket.emit('message', 'o'); // Send 'o' to the server
});

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});