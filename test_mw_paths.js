
const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const BASE_URL = 'https://api.microworkers.com/api/v2';

const endpoints = [
    '/basic-campaigns/configuration',
    '/basic_campaigns/configuration',
    '/basic-categories',
    '/basic_categories'
];

async function test() {
    for (const endpoint of endpoints) {
        const url = `${BASE_URL}${endpoint}`;
        console.log(`Testing: ${url}`);
        try {
            const response = await fetch(url, {
                headers: { 'MicroworkersApiKey': API_KEY }
            });
            console.log(`Status: ${response.status}`);
            const text = await response.text();
            console.log(`Response (first 100): ${text.substring(0, 100)}`);
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
    }
}
test();
