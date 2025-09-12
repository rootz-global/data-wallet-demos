import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Epistery from 'epistery';

// Get directory paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const app = express();

  // attach Epistery directly to app
  const epistery = await Epistery.connect();
  await epistery.attach(app);

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  const PORT = process.env.PORT || 4080;
  const PORTSSL = process.env.PORT || 4443;

  app.listen(PORT, () => {
    console.log(`Test site: http://localhost:${PORT}`);
    console.log(`Status: http://localhost:${PORT}/.epistery/status`);
  });
}

main().catch(err => {
  console.error('Test server failed to start:', err);
  process.exit(1);
});
