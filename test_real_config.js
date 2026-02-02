import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Using the key from .env.local
const API_KEY = process.env.MW_API_KEY;

// testing the correct V2 base
const BASE_URL = 'https://ttv.microworkers.com/api/v2';

async function test() {
    console.log('Testing with API Key from .env.local');
    console.log('Testing URL:', `${BASE_URL}/basic_campaigns/configuration`);

    try {
        const res = await fetch(`${BASE_URL}/basic_campaigns/configuration`, {
            headers: { 'MicroworkersApiKey': API_KEY }
        });
        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Response:', text.substring(0, 500));
    } catch (e) {
        console.log('Error:', e.message);
    }
}
test();
