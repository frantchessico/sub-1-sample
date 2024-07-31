import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';
import { createNewsletter } from './service/newsletter.service';
import { connection } from './configs/mongodb';
import { sub } from './configs/subscriber';
import { Server } from 'ws';

connection();

const app = express();
app.use(express.json());
app.use(morgan('dev'));

const port = process.env.PORT || 3300;

// WebSocket server setup
const wss = new Server({ noServer: true });
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
      <body>
        <h1>Welcome to Subscriber 1 Sample</h1>
        <script>
          const ws = new WebSocket('ws://localhost:${port}/ws');
          ws.onmessage = function(event) {
            const message = JSON.parse(event.data);
            console.log('Received message:', message);
            // Display the message or update the UI
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
app.listen(port, () => {
  console.log(`Server on http://localhost:${port}`);
  const server = app.listen(port);
  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws: any) => {
      wss.emit('connection', ws, request);
    });
  });
});
