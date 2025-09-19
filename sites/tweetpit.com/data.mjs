/**
 * manage the list of randomly selected posts
 */

import fs from 'node:fs';
import moment from 'moment';
export default class Data {
    constructor() {
        this.maxRotation = 10;
        this.maxLife = 60; //minutes
        this.featuredRotationTime = 5; //minutes

        const dataPath = './data.json';
        let fileData = '';
        if (fs.existsSync(dataPath)) {
            fileData = fs.readFileSync(dataPath);
        }
        this.posts = fileData ? JSON.parse(fileData) : [];
        this.featuredPost = null;
        this.featuredExpiry = null;
        this.rotate();
    }

    /**
     * Get the featured post (moved from top of list for rotation)
     */
    featured() {
        if (!this.featuredPost || (this.featuredExpiry && moment().isAfter(this.featuredExpiry))) {
            this.rotateFeatured();
        }
        return this.featuredPost;
    }

    /**
     * Move top post to featured and set rotation timer
     */
    rotateFeatured() {
        if (this.posts.length > 0) {
            this.featuredPost = this.posts.shift();
            this.featuredExpiry = moment().add(this.featuredRotationTime, 'minutes');
        }
    }

    /**
     * Get top 10 sorted posts
     */
    top() {
        return this.posts.slice(0, 10);
    }

    /**
     * Given a post, randomly select it based on traffic.
     */
    tryEntry(body) {
        let record = {
            id:Data.createid(),
            created:moment().valueOf(),
            ups:0,
            downs:0,
            basePoints:100,
            body:body
        }
        this.posts.push(record);
        this.sortPosts();
        
        if (this.posts.length > this.maxRotation) {
            this.posts = this.posts.slice(0, this.maxRotation);
        }
        
        return record;
    }

    /**
     * Up or down vote a post
     */
    vote(id,stance) {
        let index = this.posts.findIndex((post)=>{return post.id === id})
        if (index >= 0) {
            if (stance) {
                this.posts[index].ups += 5;
            } else {
                this.posts[index].downs += 5;
            }
        }
        this.sortPosts();
        return {vote:stance};
    }

    /**
     * Sort posts by effective score (with time decay)
     */
    sortPosts() {
        this.posts.sort((a,b)=>{
            let scoreA = this.getEffectiveScore(a);
            let scoreB = this.getEffectiveScore(b);
            if (scoreA === scoreB) return 0;
            return scoreA > scoreB ? -1 : 1;
        });
    }

    /**
     * Calculate score with exponential time-based decay
     */
    getEffectiveScore(post) {
        let voteScore = post.ups - post.downs;
        let totalScore = (post.basePoints || 100) + voteScore;
        
        let ageInHours = moment().diff(moment(post.created), 'hours', true);
        let decayFactor = Math.pow(0.95, ageInHours);
        decayFactor = Math.max(0.01, decayFactor);
        
        return totalScore * decayFactor;
    }

    /**
     * Return current selection of posts
     */
    list() {
        return this.posts;
    }

    rotate() {
        this.sortPosts();
        fs.writeFileSync('./data.json',JSON.stringify(this.posts));
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
