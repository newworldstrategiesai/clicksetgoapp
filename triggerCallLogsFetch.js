const https = require('https');

// URL of the API endpoint
const apiUrl = 'https://localhost:3000/api/fetch-call-logs'; // Update this if you're using a deployed URL

// Make a request to the API endpoint
https.get(apiUrl, (res) => {
  let data = '';

  // A chunk of data has been received
  res.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received
  res.on('end', () => {
    console.log('Response from API:', data);
  });

}).on('error', (err) => {
  console.error('Error making request:', err.message);
});
