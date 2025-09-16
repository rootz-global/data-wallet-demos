import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Epistery } from 'epistery';
import http from "http";

// Get directory paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const app = express();

  // attach Epistery directly to app
  const epistery = await Epistery.connect();
  // await epistery.attach(app);

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  const PORT = process.env.PORT || 4080;

  // Only HTTP server - SSL terminated at main process
  const http_server = http.createServer(app);
  http_server.listen(PORT);
  http_server.on('error', console.error);
  http_server.on('listening',()=>{
    let address = http_server.address();
    console.log(`HTTP Listening on ${address.address} ${address.port} (${address.family})`);
  });
  console.log(`Test site: http://localhost:${PORT}`);
}

main().catch(err => {
  console.error('Test server failed to start:', err);
  process.exit(1);
});
