const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const url = 'https://ttv.microworkers.com/api/v2/basic-categories';

async function test() {
    const res = await fetch(url, {
        headers: {
            'MicroworkersApiKey': API_KEY
        }
    });
    const data = await res.json();
    const text = JSON.stringify(data);
    if (text.includes('1001')) {
        console.log('Found 1001!');
    } else {
        console.log('1001 not found');
    }
}
test();
