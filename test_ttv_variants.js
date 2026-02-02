
const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const tests = [
    'https://ttv.microworkers.com/api/v2/basic_campaigns/configuration',
    'https://ttv.microworkers.com/api/v2/basic-campaigns/configuration',
    'https://ttv.microworkers.com/api/v2/templates',
];

async function run() {
    for (const url of tests) {
        console.log(`Testing: ${url}`);
        try {
            const res = await fetch(url, {
                headers: { 'MicroworkersApiKey': API_KEY }
            });
            console.log(`Status: ${res.status}`);
            const text = await res.text();
            console.log(`Response: ${text.substring(0, 100)}...`);
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
    }
}
run();
