import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';
import { createNewsletter } from './service/newsletter.service';
import { connection } from './configs/mongodb';
import { sub } from './configs/subscriber';
import { Server as WebSocketServer, WebSocket } from 'ws';

connection();

const app = express();
app.use(express.json());
app.use(morgan('dev'));

// WebSocket server setup
const wss = new WebSocketServer({ noServer: true });
const clients: Set<WebSocket> = new Set();

wss.on('connection', (ws: WebSocket) => {
  clients.add(ws);

  ws.on('message', (message: any) => {
    console.log(`Received message => ${message}`);
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

app.get('/', (_, res) => {
  res.send(`
    <html>
      <head>
        <title>Subscriber 1 Sample</title>
        <style>
          #messages {
            border: 1px solid #ccc;
            padding: 10px;
            height: 300px;
            overflow-y: scroll;
          }
          .message {
            padding: 5px;
            border-bottom: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <h1>Welcome to Subscriber 1 Sample</h1>
        <div id="messages"></div>
        <script>
          const ws = new WebSocket('ws://' + window.location.host + '/ws');
          ws.onmessage = function(event) {
            const message = JSON.parse(event.data);
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.textContent = 'Received message: ' + JSON.stringify(message);
            document.getElementById('messages').appendChild(messageElement);
            document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
          };
        </script>
      </body>
    </html>
  `);
});

// Handle Pub/Sub subscription
sub.subscribe('newsletter', ['pubsub'], async (message: string) => {
  console.log('SUB 1');
  const msg = JSON.parse(message);

  await createNewsletter(msg.name, msg.email);

  // Broadcast message to all WebSocket clients
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg));
    }
  });
});

// Integrate WebSocket server with Express
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server on http://localhost:${port}`);
});

server.on('upgrade', (request, socket, head) => {
  if (request.url === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});
