import express from 'express';
import fs from 'fs';
import {resolve,join} from 'path';
import {marked} from 'marked';
import http from "http";
import https from "https";
import child_process from "child_process";

const rootDomain = 'thirdparty.company';

async function main() {
  const app = express();
  let http_port = (process.env.PORT || 4080);
  let https_port = (process.env.PORTSSL || 4443);

  // fetch the repo readme and page template to use as the home page
  const template = (fs.readFileSync(resolve('./index.html'))).toString();
  const readme = (fs.readFileSync(resolve('./README.md'))).toString();
  const body = marked.parse(readme);
  const home = template.replace('{{content}}',body);

  // spawn sites
  let siteIndex = 1;
  const sites = (fs.readdirSync(resolve('./sites'))).reduce((result,site)=>{
    const options = {
      cwd: resolve(`./sites/${site}`),
      env: {PORT:http_port+siteIndex,PORTSSL:https_port+siteIndex,DOMAIN:site}
    };
    const proc = child_process.spawn('npm',['run','start'],options);
    proc.stderr.on('data', (data) => {
      console.error(`${site}:stderr: ${data}`);
    });

    proc.on('close', (code) => {
      console.log(`${site}:npm install process exited with code ${code}`);
    });

    proc.on('error', (err) => {
      console.error(`${site}:Failed to start npm process:`, err);
    });
    result[site] = {name:site,proc:proc,options:options,index:siteIndex++};
    return result;
  },{});

  app.get('/', async (req, res) => {
    const domain = (req.hostname.endsWith('localhost'))?req.hostname.replace(/localhost$/,rootDomain):req.hostname;
    if (domain === rootDomain) {
      res.set('Content-Type', 'text/html');
      res.send(home);
    } else {
      const site = sites[domain];
      if (site) {
        if (req.secure) {
          res.redirect(`https://127.0.0.1:${site.options.env.PORTSSL}`)
        } else {
          res.redirect(`http://127.0.0.1:${site.options.env.PORT}`)
        }
      } else {
        res.status(404).send('Site Not found');
      }
    }
  });

  // start http server
  const http_server = http.createServer(app);
  http_server.listen(http_port);
  http_server.on('error', console.error);
  http_server.on('listening',()=>{
    let address = http_server.address();
    console.log(`Listening on ${address.address} ${address.port} (${address.family})`);
  });
  // const https_server = https.createServer(certify.SNI,app);
  // https_server.listen(https_port);
  // https_server.on('error', console.error);
  // https_server.on('listening',()=>{
  //   let address = https_server.address();
  //   console.log(`Listening on ${address.address} ${address.port} (${address.family})`);
  // });
}

main().catch(err => {
  console.error('Test server failed to start:', err);
  process.exit(1);
});
