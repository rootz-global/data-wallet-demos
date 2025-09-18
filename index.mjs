import express from 'express';
import fs from 'fs';
import {resolve,join} from 'path';
import {marked} from 'marked';
import axios from 'axios';
import http from "http";
import https from "https";
import child_process from "child_process";
import ini from 'ini';
import { Epistery } from 'epistery';
import { Certify, Synchronize } from '@metric-im/administrate';

const rootDomain = 'thirdparty.company';

async function main() {
  const app = express();
  let http_port = (process.env.PORT || 4080);
  let https_port = (process.env.PORTSSL || 4443);
  const spawn_port = (process.env.PORTSPAWN || 53874);

  // middleware to manage SSL cert
  const certify = await Certify.attach(app,{contactEmail:'michael@sprague.com'});
  // middleware to handle epistery data wallets
  const epistery = await Epistery.connect();
  await epistery.setDomain(rootDomain);
  // await epistery.attach(app);

  // web hook for github updates to repository
  await Synchronize.attach(app,undefined,'main');

  // fetch the repo readme and page template to use as the home page
  const template = (fs.readFileSync(resolve('./index.html'))).toString();
  const readme = (fs.readFileSync(resolve('./README.md'))).toString();
  const body = marked.parse(readme);
  const home = template.replace('{{content}}',body);

  // spawn sites
  const env = {};
  if (fs.existsSync(resolve('./.env'))) {
    const envText = fs.readFileSync(resolve('./.env')).toString();
    Object.assign(env,ini.decode(envText));
  }
  let siteIndex = 1;
  const sites = (fs.readdirSync(resolve('./sites'))).reduce((result,site)=>{
    const childPORT = parseInt(spawn_port)+siteIndex;
    const options = {
      cwd: resolve(`./sites/${site}`),
      env: {PORT:childPORT,DOMAIN:site,IPFS_URL:'https://rootz.digital/api/v0'}
    };
    try {
      const proc = child_process.spawn('npm',['run','start'],options);
      proc.stdout.on('data', (data) => {
        process.stdout.write(`${site}: ${data.toString()}`)
      });
      proc.stderr.on('data', (data) => {
        process.stdout.write(`${site}:E: ${data.toString()}`);
      });
      proc.on('close', (code) => {
        console.log(`${site}:npm install process exited with code ${code}`);
      });
      proc.on('error', (err) => {
        console.error(`${site}:Failed to start npm process:`, err);
      });
      result[site] = {name:site,proc:proc,options:options,index:siteIndex++};
    } catch(e) {
      console.log(e);
      return result;
    }
    return result;
  },{});

  app.get('/style.css', (req,res)=>{
    res.sendFile(`${resolve('./style.css')}`);
  });
  app.all(/.*/, async (req, res) => {
    const domain = (req.hostname.endsWith('localhost'))?req.hostname.replace(/localhost$/,rootDomain):req.hostname;
    if (domain === rootDomain) {
      res.set('Content-Type', 'text/html');
      res.send(home);
    } else {
      const site = sites[domain];
      if (site) {
        let target = `http://127.0.0.1:${site.options.env.PORT}${req.url}`;
        const method = req.method;
        const isBodyMethod = ['POST', 'PUT', 'PATCH'].includes(method);
        const payload = isBodyMethod ? req.body.payload : null;
        const headersToForward = {
          ...req.headers,
          host: undefined, // Prevent host mismatch
          'content-length': undefined // Let Axios compute
        };
        const response = await axios({
          method,
          url: target,
          headers: headersToForward,
          data: payload,
          params: req.query, // for GET or forwarded query string
          validateStatus: () => true, // allow non-2xx responses to pass through
        });

        res.status(response.status).set(response.headers).send(response.data);
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
  const https_server = https.createServer(certify.SNI,app);
  https_server.listen(https_port);
  https_server.on('error', console.error);
  https_server.on('listening',()=>{
    let address = https_server.address();
    console.log(`Listening on ${address.address} ${address.port} (${address.family})`);
  });

  function killAllChildProcesses() {
    console.log('Killing all spawned child processes...');
    Object.values(sites).forEach(site => {
      if (site.proc && !site.proc.killed) {
        console.log(`Killing process for site: ${site.name}`);
        site.proc.kill('SIGTERM');
      }
    });
  }

  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    killAllChildProcesses();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    killAllChildProcesses();
    process.exit(0);
  });

  process.on('exit', () => {
    killAllChildProcesses();
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    killAllChildProcesses();
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    killAllChildProcesses();
    process.exit(1);
  });
}

main().catch(err => {
  console.error('Test server failed to start:', err);
  process.exit(1);
});
