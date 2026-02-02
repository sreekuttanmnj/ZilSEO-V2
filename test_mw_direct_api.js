const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';

// Test different endpoint variations
const tests = [
    { url: 'https://ttv.microworkers.com/api/v2/basic_campaigns/configuration', desc: 'basic_campaigns (underscore)' },
    { url: 'https://ttv.microworkers.com/api/v2/basic-campaigns/configuration', desc: 'basic-campaigns (hyphen)' },
    { url: 'https://ttv.microworkers.com/api/v2/templates', desc: 'templates endpoint' },
];

async function testEndpoints() {
    for (const test of tests) {
        console.log(`\nTesting: ${test.desc}`);
        console.log(`URL: ${test.url}`);
        try {
            const response = await fetch(test.url, {
                headers: { 'MicroworkersApiKey': API_KEY }
            });
            console.log(`Status: ${response.status}`);
            const text = await response.text();
            console.log(`Response (first 200 chars): ${text.substring(0, 200)}`);

            // Try to parse as JSON
            try {
                const json = JSON.parse(text);
                console.log(`✅ Valid JSON response`);
            } catch (e) {
                console.log(`❌ NOT JSON - ${e.message}`);
            }
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
    }
}

testEndpoints();
