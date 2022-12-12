require('dotenv').config({ path: `${__dirname}/.env` });

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT ? +process.env.PORT : 3000;
const KEY = process.env.KEY;

const app = express();
const set = new Set();
let last = -1;
let data = null;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.post('/api/report', (req, res) => {
  if (!req.headers['x-hub-signature'] || req.headers['x-hub-signature'] !== KEY) {
    res.status(403).send('Forbidden');
    return;
  }
  last = Date.now();
  data = req.body;
  for (const ws of set) {
    ws.send(JSON.stringify({ last, data }), function () {
      // Ignore errors.
    });
  }
  res.send('Hello World!')
});

/**
 * Create an HTTP server.
 */
const server = http.createServer(app);

/**
 * Create a WebSocket server completely detached from the HTTP server.
 */
const wss = new WebSocketServer({ clientTracking: false, noServer: true });
server.on('upgrade', function (request, socket, head) {
  wss.handleUpgrade(request, socket, head, function (ws) {
    wss.emit('connection', ws);
  });
});

wss.on('connection', function (ws) {
  set.add(ws);

  ws.send(JSON.stringify({ last, data }), function () {
    // Ignore errors.
  });

  ws.on('close', function () {
    set.delete(ws);
  });
});

server.listen(PORT, function () {
  console.log(`[INFO] App listening on port ${PORT}`)
});
