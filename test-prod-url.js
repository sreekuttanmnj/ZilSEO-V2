const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const URL = 'https://ttv.microworkers.com/api/v2/basic-campaigns/configuration';

async function test() {
    console.log('Testing Production URL:', URL);
    try {
        const response = await fetch(URL, {
            headers: { 'MicroworkersApiKey': API_KEY }
        });
        console.log('Status:', response.status);
        const text = await response.text();
        try {
            const data = JSON.parse(text);
            console.log('Response JSON:', JSON.stringify(data, null, 2));
        } catch (e) {
            console.log('Response Text (first 500 characters):', text.substring(0, 500));
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}
test();
