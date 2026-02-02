
const fetch = require('node-fetch'); // Or native fetch in Node 18+
// In this environment we probably have native fetch if node is recent, otherwise https
const https = require('https');

const url = 'https://zilmoney.com/check-printing-software-download/';

const fetchUrl = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
};

fetchUrl(url).then(html => {
    console.log("HTML URL:", url);
    console.log("Length:", html.length);
    console.log("Title Match:", html.match(/<title>(.*?)<\/title>/));
    console.log("H1 Match:", html.match(/<h1[^>]*>(.*?)<\/h1>/));
    console.log("Meta Desc:", html.match(/<meta\s+name="description"\s+content="(.*?)"/));
    console.log("OG Title:", html.match(/<meta\s+property="og:title"\s+content="(.*?)"/));

    // Check for content containers
    console.log("Has article?", html.includes('<article'));
    console.log("Has main?", html.includes('<main'));
    console.log("Has .post-content?", html.includes('class="post-content'));
    console.log("Has #content?", html.includes('id="content"'));

    // Snippet
    console.log("Snippet:", html.substring(0, 500));
}).catch(console.error);
