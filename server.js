// server.js
const express = require('express');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Serve the static index.html file
  server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
  });

  // Serve other static files
  server.use(express.static(path.join(__dirname, 'public')));

  // Default next.js handler
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
