
const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const BASE_URLS = [
    'https://ttv.microworkers.com/api/v2',
    'https://api.microworkers.com/api/v2'
];

const endpoints = [
    '/templates',
    '/basic_campaigns',
    '/basic_categories',
    '/basic_campaigns/configuration',
    '/basic-campaigns/configuration',
    '/basic-categories'
];

async function test() {
    for (const base of BASE_URLS) {
        for (const endpoint of endpoints) {
            const url = `${base}${endpoint}`;
            console.log(`Testing: ${url}`);
            try {
                const response = await fetch(url, {
                    method: endpoint.includes('configuration') || endpoint.includes('categories') ? 'GET' : 'OPTIONS',
                    headers: { 'MicroworkersApiKey': API_KEY }
                });
                console.log(`Status: ${response.status}`);
                const text = await response.text();
                console.log(`Response: ${text.substring(0, 100)}`);
            } catch (e) {
                console.log(`Error: ${e.message}`);
            }
        }
    }
}
test();
