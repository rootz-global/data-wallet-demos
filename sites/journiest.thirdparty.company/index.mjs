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

  app.use(express.json({limit: '50mb'}));
  app.use(express.urlencoded({extended: true}));

  const epistery = await Epistery.connect();
  await epistery.attach(app);

  // Serve static files (CSS, images, etc.)
  app.use('/public', express.static(path.join(__dirname, 'public')));

  // Serve article pages
  app.get('/articles/:slug', (req, res) => {
    const articlePath = path.join(__dirname, 'articles', `${req.params.slug}.html`);
    res.sendFile(articlePath, (err) => {
      if (err) {
        res.status(404).send('<h1>Article not found</h1><p><a href="/">Back to home</a></p>');
      }
    });
  });

  // Serve category pages (placeholder for now)
  app.get('/destinations', (req, res) => {
    res.redirect('/');
  });

  app.get('/travel-tips', (req, res) => {
    res.redirect('/');
  });

  app.get('/lifestyle', (req, res) => {
    res.redirect('/');
  });

  // Serve home page
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  const PORT = process.env.PORT || 4080;

  const http_server = http.createServer(app);
  http_server.listen(PORT);
  http_server.on('error', console.error);
  http_server.on('listening',()=>{
    let address = http_server.address();
    console.log(`Journiest.thirdparty.company: HTTP Listening on ${address.address} ${address.port} (${address.family})`);
  });
  console.log(`Journiest.thirdparty.company: Test site: http://localhost:${PORT}`);
}

main().catch(err => {
  console.error('Test server failed to start:', err);
  process.exit(1);
});
