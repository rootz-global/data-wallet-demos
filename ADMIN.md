# Data Wallet Demos Configuration

This project is configured to adopt a few dozen demo applications under one deployment.
It listens for both http and https requests, handling its own certs through epistery, and
relays all requests to any of the sites declared in the `sites` folder.

When the process launches it spawn a process for each site in the sites folder, applying incremental
ports to those defined in PORT for http and PORTSSL for https.
Nginx listens on 80 and 443 for *.thirdparty.company and forwards the request to data-wallet-demos.
In turn, it determines which process is active based on domain and relays all traffic to the spawned
process.

## Usage

## Project Structure

| Item    | Description                                                                                                                    |
|---------|--------------------------------------------------------------------------------------------------------------------------------|
| /config | Contains configuration scripts for nginx and systemctl                                                                         |
| /sites  | Contains a folder for each site named by domain. Each is an npm project of its own and should implement the npm script 'start' |
| /sites-paused | Paused sites are works in process or otherwise not requested to be spawned at launch |
| /index.html | When no subdomain is provided, the root site, thirdparty.company, is presented. index.html is a template. The cotent is pulled from the project README |
| /index.mjs | entry point |

Each site can be developed and debugged independently

>**NOTE**: Epistery has not been released to npm, so these demos are dependent on a relative path to the epistery repository provided in package.json 
