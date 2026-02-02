// Quick test of Microworkers API
const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const MW_BASE_URL = 'https://api.microworkers.com';

async function testMWAPI() {
    try {
        console.log('Testing Microworkers API...');
        console.log('Endpoint:', `${MW_BASE_URL}/v2/basic-campaigns/configuration`);

        const response = await fetch(`${MW_BASE_URL}/v2/basic-campaigns/configuration`, {
            method: 'GET',
            headers: {
                'MicroworkersApiKey': API_KEY,
                'Accept': 'application/json'
            }
        });

        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));

        const text = await response.text();
        console.log('Raw Response:', text.substring(0, 500));

        try {
            const json = JSON.parse(text);
            console.log('Parsed JSON:', JSON.stringify(json, null, 2));
        } catch (e) {
            console.error('JSON Parse Error:', e.message);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testMWAPI();
