import express from 'express';
import http from 'http';
import cors from 'cors';
import path from "path";
import {fileURLToPath} from "url";
import Data from "./data.mjs";
const root = path.dirname(fileURLToPath(import.meta.url));
const library = {
    'moment':'/moment/min/moment-with-locales.js'
}

let main = async function() {
    let app = express();
    let data = new Data();
    app.__dirname = root;
    app.use(cors({
        origin: function(origin, callback){
            return callback(null, true);
        },
        credentials:true
    }));
    app.use(express.urlencoded({extended: true}));
    app.use(express.json({limit: '50mb'}));
    app.get('/health', (req, res) => { res.status(200).send() });
    // utility for constructing random alpha root names. Cap at 256 so it's not abused.
    app.post('/post',(req,res)=>{
        try {
            let result = data.tryEntry(req.body.text);
            res.status(200).json(result);
        } catch(e) {
            console.error(e);
            res.status(500).json({status:'error',message:e.message});
        }
    });
    app.get('/featured',(req,res) =>{
        try {
            let result = data.featured();
            res.status(200).json(result || {body:"Working... Post something."});
        } catch(e) {
            console.error(e);
            res.status(500).json({status:'error',message:e.message});
        }
    })
    app.get('/vote/:id/:like',(req,res)=>{
        try {
            let result = data.vote(req.params.id,!!req.params.like.match(/true/));
            res.status(200).json(result);
        } catch(e) {
            console.error(e);
            res.status(500).json({status:'error',message:e.message});
        }
    });
    app.get('/list',(req,res)=>{
        try {
            let result = data.list();
            res.status(200).json(result);
        } catch(e) {
            console.error(e);
            res.status(500).json({status:'error',message:e.message});
        }
    });
    app.get('/top',(req,res) =>{
        try {
            let result = data.top();
            res.status(200).json(result);
        } catch(e) {
            console.error(e);
            res.status(500).json({status:'error',message:e.message});
        }
    });
    /**
     * Lib paths are used to expose foreign modules to the browser. Only modules
     * declared in *library* are available
     */
    app.get('/lib/:module/:path?',(req,res)=>{
        let modulePath = library[req.params.module];
        if (req.params.path) modulePath += req.params.path;
        if (!modulePath) return res.status(404).send();
        modulePath = path.resolve('./node_modules/'+modulePath);
        res.set("Content-Type","text/javascript");
        res.sendFile(modulePath);
    });
    app.use('/',express.static(root+"/site"));

    let server = http.createServer(app);
    server.listen(process.env.PORT || 3000);
    server.on('error', console.error);
    server.on('listening',()=>console.log(`tweetpit.thirdparty.company listening on port ${server.address().port}`));
}();

process.on('SIGINT', function() {
    console.log("Shutting down");
    process.exit();
});
