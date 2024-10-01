const https = require('https');

// URL of the API endpoint for a production server (using HTTPS)
const apiUrl = 'https://yourapp.vercel.app/api/fetch-call-logs';

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
