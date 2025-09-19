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
        console.log('Data constructor - looking for file at:', dataPath);
        let fileData = '';
        if (fs.existsSync(dataPath)) {
            fileData = fs.readFileSync(dataPath);
            console.log('Loaded data file, length:', fileData.length);
        } else {
            console.log('Data file does not exist, starting with empty array');
        }
        this.posts = fileData ? JSON.parse(fileData) : [];
        console.log('Initialized with', this.posts.length, 'posts:', this.posts);
        this.featuredPost = null;
        this.featuredExpiry = null;
        this.rotate();
    }

    /**
     * Get the featured post (moved from top of list for rotation)
     */
    featured() {
        console.log('featured() called - featuredPost:', this.featuredPost, 'expiry:', this.featuredExpiry);
        if (!this.featuredPost || (this.featuredExpiry && moment().isAfter(this.featuredExpiry))) {
            console.log('Rotating featured post...');
            this.rotateFeatured();
        }
        console.log('Returning featured post:', this.featuredPost);
        return this.featuredPost;
    }

    /**
     * Move top post to featured and set rotation timer
     */
    rotateFeatured() {
        console.log('rotateFeatured() called - posts.length:', this.posts.length);
        if (this.posts.length > 0) {
            this.featuredPost = this.posts.shift();
            this.featuredExpiry = moment().add(this.featuredRotationTime, 'minutes');
            console.log('Set new featured post:', this.featuredPost);
        } else {
            console.log('No posts available for featuring');
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
        console.log('tryEntry called with body:', body, 'type:', typeof body);
        
        // Ensure body is a string and handle undefined/null
        const bodyText = (body == null || body === undefined) ? '' : String(body);
        console.log('Processed bodyText:', bodyText);
        
        let record = {
            id:Data.createid(),
            created:moment().valueOf(),
            ups:0,
            downs:0,
            basePoints:100,
            body:bodyText
        }
        console.log('Created record:', record);
        console.log('Record.body specifically:', record.body);
        
        this.posts.push(record);
        this.sortPosts();
        
        if (this.posts.length > this.maxRotation) {
            this.posts = this.posts.slice(0, this.maxRotation);
        }
        
        console.log('Posts after adding:', this.posts.length, 'posts');
        console.log('First post body:', this.posts[0]?.body);
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
        try {
            const jsonData = JSON.stringify(this.posts);
            console.log('Writing data.json with', this.posts.length, 'posts, first post:', this.posts[0]);
            fs.writeFileSync('./data.json', jsonData);
            console.log('Successfully wrote data.json');
        } catch(e) {
            console.error('Error writing data.json:', e);
        }
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
