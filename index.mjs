import express from 'express';
import {resolve,join} from 'path';
import Epistery from 'epistery';

async function main() {
  const app = express();

  // attach Epistery directly to app
  const epistery = await Epistery.connect();
  await epistery.attach(app);

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  const PORT = process.env.TEST_PORT || 3001;

  app.listen(PORT, () => {
    console.log(`Test site: http://localhost:${PORT}`);
    console.log(`Status: http://localhost:${PORT}/.epistery/status`);
  });
}

main().catch(err => {
  console.error('Test server failed to start:', err);
  process.exit(1);
});
