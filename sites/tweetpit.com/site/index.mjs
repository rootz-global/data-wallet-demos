/**
 *
 */
onload = async () =>{
    let mainDiv = document.querySelector('#main');
    let entryPost = document.querySelector('#entry-post');
    let entryStatus = document.querySelector('#entry-status');
    let entrySend = document.querySelector('#entry-send');
    let featured = document.querySelector('#featured');
    let voteButton = document.querySelector('#vote');
    let showTopButton = document.querySelector('#show-top');
    let popup = document.querySelector('#popup-shim');
    let candidates = document.querySelector('#feature-list');
    let topList = document.querySelector('#top-list');
    entryPost.setAttribute('maxlength','256');
    let statusDefault = "Please avoid profanity"
    entryStatus.innerHTML = statusDefault;

    entryPost.addEventListener('input',(e) =>{
        entryStatus.innerHTML = `${entryPost.value.length} of ${entryPost.getAttribute('maxlength')}`;
    });

    entrySend.addEventListener('click',async (e) =>{
        entryStatus.innerHTML = 'Posting...';
        try {
            console.log('Frontend: About to post with text:', entryPost.value);
            let postData = {text:entryPost.value};
            console.log('Frontend: Post data object:', postData);
            let result = await API.post('/post', postData);
            console.log('Frontend: Got result:', result);
            entryPost.value = '';
            if (result.id) {
                entryStatus.innerHTML = 'Posted! Your submission entered the lottery.';
            } else {
                entryStatus.innerHTML = 'The lottery is full. Try again later.';
            }
            setTimeout(() => {
                entryStatus.innerHTML = statusDefault;
            }, 3000);
        } catch(e) {
            console.error('Frontend: Error posting:', e);
            entryStatus.innerHTML = 'Error posting. Please try again.';
            setTimeout(() => {
                entryStatus.innerHTML = statusDefault;
            }, 3000);
        }
    });
    voteButton.addEventListener('click',async ()=>{
        let result = await API.get('/list');
        candidates.innerHTML = result.reduce((result,post)=>{
            result += `<div id="${post.id}" class="feature-option">
                <div class="option-emotion">
                    <span class='icon icon-thumbs-down'></span>
                </div>
                <div class="option-body">${post.body}</div>
                <div class="option-emotion">
                    <span class='icon icon-thumbs-up'></span>
                </div>
            </div>`
            return result;
        },'<h2>Candidates for the Feature</h2><span class="icon exit icon-circle-with-cross"></span>');
        popup.classList.add('active');
        candidates.classList.add('active');
        document.querySelector('#feature-list .exit').addEventListener('click',()=>{
            candidates.classList.remove('active');
        });
        document.querySelectorAll('.feature-option').forEach((option)=>{
            option.querySelector('.icon-thumbs-up').addEventListener('click',async ()=>{
                if (option.classList.contains('up') || option.classList.contains('down')) return;
                option.classList.add('up');
                await API.get(`/vote/${option.id}/true`);
            });
            option.querySelector('.icon-thumbs-down').addEventListener('click',async ()=>{
                if (option.classList.contains('up') || option.classList.contains('down')) return;
                option.classList.add('down');
                await API.get(`/vote/${option.id}/false`);
            });
        });
    });

    showTopButton.addEventListener('click',async ()=>{
        let result = await API.get('/top');
        topList.innerHTML = result.reduce((html,post,index)=>{
            let basePoints = post.basePoints || 100;
            let voteScore = post.ups - post.downs;
            let totalRaw = basePoints + voteScore;
            html += `<div class="top-option">
                <div class="top-rank">#${index + 1}</div>
                <div class="top-body">${post.body}</div>
                <div class="top-score">Points: ${totalRaw} (Base: ${basePoints} + Votes: ${voteScore})</div>
            </div>`
            return html;
        },'<h2>Top Ten Posts</h2><span class="icon exit icon-circle-with-cross"></span>');
        popup.classList.add('active');
        topList.classList.add('active');
        document.querySelector('#top-list .exit').addEventListener('click',()=>{
            topList.classList.remove('active');
            popup.classList.remove('active');
        });
    });

    popup.addEventListener('click',(e)=>{
        if (e.target === popup) {
            candidates.classList.remove('active');
            topList.classList.remove('active');
            popup.classList.remove('active');
        }
    })

    await updateFeature();

    async function updateFeature() {
        let result = await API.get('/featured');
        featured.innerHTML = result.body;
        setTimeout(updateFeature,5000);
    }
}


class API {
    static async get(path,options={},format="json") {
        if (path.charAt(0) !== '/') path = '/'+path;
        options.credentials = 'include';
        let response = await fetch(path,options);
        if (response.ok) {
            return response.status===204?{}:await response[format]();
        } else {
            let e = new Error(`failed to fetch ${path}`);
            e.status = response.status;
            e.response = await response.text();
            throw(e);
        }
    }
    static async post(path,body) {
        if (path.charAt(0) !== '/') path = '/'+path;
        console.log('API.post called with path:', path, 'body:', body);
        let jsonBody = JSON.stringify(body);
        console.log('API.post stringified body:', jsonBody);
        let options = {method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:jsonBody};
        console.log('API.post options:', options);
        let response = await fetch(path,options);
        console.log('API.post response status:', response.status);
        if (response.ok) {
            return response.status===204?{}:await response.json();
        } else {
            let e = new Error(`failed update ${path}`);
            e.status = response.status;
            try {e.response = await response.json()} catch(e) {e.response = response.statusText}
            throw(e);
        }
    }
    static async remove(path) {
        if (path.charAt(0) !== '/') path = '/'+path;
        let options = {method:'DELETE',credentials:'include',headers:{'Content-Type':'application/json'}};
        let response = await fetch(path,options);
        if (!response.ok) {
            let e = new Error(`failed remove ${path}`);
            e.status = response.status;
            e.response = await response.text();
            throw(e);
        }
    }
}

