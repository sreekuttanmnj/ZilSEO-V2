import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const API_KEY = process.env.MW_API_KEY || '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const BASE_URL = process.env.MW_BASE_URL || 'https://ttv.microworkers.com/api/v2';

console.log('Testing with loaded environment variables:');
console.log('API Key:', API_KEY.substring(0, 10) + '...');
console.log('Base URL:', BASE_URL);
console.log('');

async function testAPI() {
    const url = `${BASE_URL}/basic_campaigns/configuration`;
    console.log('Testing URL:', url);

    try {
        const response = await fetch(url, {
            headers: { 'MicroworkersApiKey': API_KEY }
        });

        console.log('Status:', response.status);
        console.log('Content-Type:', response.headers.get('content-type'));

        const text = await response.text();
        console.log('Response (first 200 chars):', text.substring(0, 200));

        if (response.status === 401) {
            console.log('\n❌ ERROR: API Key is invalid or unauthorized');
            console.log('Please verify:');
            console.log('1. You have a valid Microworkers account');
            console.log('2. Your API key is from the PRODUCTION account (not sandbox)');
            console.log('3. The API key has the correct permissions');
        } else if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
            console.log('\n❌ ERROR: API is returning HTML instead of JSON');
            console.log('This usually means the endpoint URL is wrong or API key is invalid');
        } else {
            try {
                const json = JSON.parse(text);
                console.log('\n✅ SUCCESS: Valid JSON response');
                console.log('Response:', JSON.stringify(json, null, 2).substring(0, 500));
            } catch (e) {
                console.log('\n❌ ERROR: Response is not valid JSON');
            }
        }
    } catch (e) {
        console.log('Error:', e.message);
    }
}

testAPI();
