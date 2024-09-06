const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve your client files or other routes if needed
app.get('/', (req, res) => {
  res.send('WebSocket Server is Running');
});

// WebSocket connection
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    ws.send(`o`); // Echo the message back to the client
    // ws.send(`Echo: ${message}`); // Echo the message back to the client
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
