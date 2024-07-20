const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const AUTH_TOKEN = process.env.WEBHOOK_AUTH_TOKEN;

// Middleware to check auth token
app.use((req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(401).send('Unauthorized');
  }
  next();
});

// Endpoint for VAPI webhook
app.post('/vapi-webhook', (req, res) => {
  const data = req.body;

  // Log the received data for debugging purposes
  console.log('Received data:', data);

  // Assuming the incoming data is an array and we take the first element
  const message = data[0]?.message;

  if (!message) {
    res.status(400).send('No message found in the request');
    return;
  }

  // Store the message in the in-memory array
  messages.push(message);

  // Emit the new message to all connected clients
  io.emit('newMessage', message);

  // Construct the response payload
  const responsePayload = {
    // Your response payload here
  };

  res.json(responsePayload);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
