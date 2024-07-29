const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

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

// Function to parse CSV and find contact
const parseCSV = () => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(process.cwd(), 'data', 'Corrected_Contacts.csv');
    const fileContents = fs.readFileSync(filePath, 'utf8');

    Papa.parse(fileContents, {
      header: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

// Endpoint for VAPI webhook
app.post('/vapi-webhook', async (req, res) => {
  console.log('Received request at /vapi-webhook');

  const data = req.body;

  // Log the received data for debugging purposes
  console.log('Received data:', data);

  const phoneNumber = data.message?.customer?.number?.replace(/\D/g, '');

  console.log('Extracted phone number:', phoneNumber);

  try {
    const contacts = await parseCSV();

    console.log('Parsed CSV data:', contacts);

    const contact = contacts.find(
      (contact) => contact.phone.replace(/\D/g, '') === phoneNumber
    );

    const firstName = contact ? contact.first_name : 'Unknown';
    console.log('Determined first name:', firstName);

    // Emit the new message to all connected clients
    io.emit('newMessage', { firstName, phoneNumber });

    // Construct the response payload
    const responsePayload = {
      status: 'success',
      received: { firstName, phoneNumber }
    };

    res.json(responsePayload);
  } catch (error) {
    console.error('Error reading or parsing CSV:', error);
    res.status(500).send('Error reading or parsing CSV');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
