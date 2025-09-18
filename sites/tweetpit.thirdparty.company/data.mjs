/**
 * manage the list of randomly selected posts
 */

import fs from 'node:fs';
import path from 'path';
import os from 'os';
import moment from 'moment';
export default class Data {
    constructor() {
        this.maxRotation = 10;
        this.maxLife = 60; //minutes

        const dataDir = path.join(os.homedir(), '.tweetpit');
        const dataPath = path.join(dataDir, 'data.json');
        
        // Ensure the .tweetpit directory exists
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // Read the data file if it exists, otherwise start with empty array
        let fileData = '';
        if (fs.existsSync(dataPath)) {
            fileData = fs.readFileSync(dataPath);
        }
        this.posts = fileData ? JSON.parse(fileData) : [];
        this.rotate();
    }

    /**
     * Get the post at the top of list. It gets sorted by votes
     * and pruned by expiration
     */
    featured() {
        // Find the first post with a body
        const validPost = this.posts.find(post => post.body && post.body.trim());
        return validPost || null;
    }

    /**
     * Given a post, randomly select it based on traffic.
     */
    tryEntry(body) {
        if (this.posts.length < this.maxRotation) {
            let record = {
                id:Data.createid(),
                exp:moment().add(this.maxLife,'minutes').valueOf(),
                ups:0,
                downs:0,
                body:body
            }
            this.posts.push(record);
            return record;
        } else {
            return {};
        }
    }

    /**
     * Up or down vote a post
     */
    vote(id,stance) {
        let index = this.posts.findIndex((post)=>{return post.id === id})
        if (index >= 0) this.posts[index][stance?'ups':'downs']++;
        this.posts.sort((a,b)=>{
            if (a.ups - a.downs === b.ups - b.downs) return 0;
            return (a.ups - a.downs > b.ups - b.downs)?-1:1;
        })
        return {vote:stance};
    }

    /**
     * Return current selection of posts
     */
    list() {
        return this.posts;
    }

    /**
     * Return posts sorted by votes (top rated)
     */
    top() {
        return this.posts.slice().sort((a, b) => {
            const aScore = (a.ups || 0) - (a.downs || 0);
            const bScore = (b.ups || 0) - (b.downs || 0);
            return bScore - aScore;
        });
    }

    rotate() {
        this.posts = this.posts.reduce((accumulator,post)=>{
            if (moment().subtract(this.maxLife,'minutes').isBefore(moment(post.exp))) {
                accumulator.push(post);
            }
            return accumulator;
        },[])
        const dataDir = path.join(os.homedir(), '.tweetpit');
        const dataPath = path.join(dataDir, 'data.json');
        
        // Ensure the .tweetpit directory exists before writing
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        fs.writeFileSync(dataPath, JSON.stringify(this.posts));
        setTimeout(this.rotate.bind(this),2000);
    }

    static createid() {
        let id = '';
        for (let i = 0; i < 16; i++) {
            id += Number(Math.round(Math.random() * 25) + 10).toString(36);
        }
        return id;
    }
}
