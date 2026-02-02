import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.MW_API_KEY;
const BASE_URL = process.env.MW_BASE_URL;

console.log('--- Environment Check ---');
console.log('API_KEY exists:', !!API_KEY);
console.log('BASE_URL:', BASE_URL);

async function check() {
    if (!API_KEY || !BASE_URL) {
        console.log('Missing API_KEY or BASE_URL');
        return;
    }

    const testUrl = `${BASE_URL}/basic_campaigns/configuration`;
    const altUrl = `${BASE_URL.replace('basic_campaigns', 'basic-campaigns')}/configuration`; // in case BASE_URL is specific

    // If BASE_URL is just the base, we append
    const urls = [
        `${BASE_URL}/basic_campaigns/configuration`,
        `${BASE_URL}/basic-campaigns/configuration`,
    ];

    for (const url of urls) {
        console.log(`\nChecking URL: ${url}`);
        try {
            const res = await fetch(url, { headers: { 'MicroworkersApiKey': API_KEY } });
            console.log(`Status: ${res.status}`);
            const text = await res.text();
            console.log(`JSON? ${text.startsWith('{') || text.startsWith('[')}`);
            console.log(`Preview: ${text.substring(0, 100)}`);
        } catch (e) { console.log('Error:', e.message); }
    }
}
check();
