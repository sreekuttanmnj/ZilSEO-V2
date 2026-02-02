
const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const variations = [
    'https://ttv.microworkers.com/api/v2/basic_campaigns/configuration',
    'https://ttv.microworkers.com/api/v2/basic-campaigns/configuration',
    'https://api.microworkers.com/api/v2/basic_campaigns/configuration',
    'https://api.microworkers.com/api/v2/basic-campaigns/configuration'
];

async function test() {
    for (const url of variations) {
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
