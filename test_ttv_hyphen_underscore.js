const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const BASE = 'https://ttv.microworkers.com/api/v2';

const tests = [
    '/basic-campaigns/configuration',
    '/basic_campaigns/configuration',
    '/templates',
    '/template',
];

async function run() {
    for (const p of tests) {
        const url = BASE + p;
        console.log(`Testing: ${url}`);
        try {
            const r = await fetch(url, { headers: { 'MicroworkersApiKey': API_KEY } });
            console.log(`Status: ${r.status}`);
            const text = await r.text();
            console.log(`JSON? ${text.startsWith('{') || text.startsWith('[')}`);
            console.log(`Preview: ${text.substring(0, 100)}`);
        } catch (e) { console.log('Error:', e.message); }
    }
}
run();
