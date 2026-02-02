const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const url = 'https://ttv.microworkers.com/api/v2/basic-campaigns/configuration';

async function test() {
    const res = await fetch(url, {
        headers: {
            'MicroworkersApiKey': API_KEY,
            'Accept': 'application/json'
        }
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text.substring(0, 500));
}
test();
