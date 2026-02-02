const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const BASE_URL = 'https://ttv.microworkers.com/api/v2';

async function test() {
    const endpoints = [
        '/sub-categories',
        '/categories/10/sub-categories',
        '/categories/10',
        '/basic-categories/10',
        '/basic-categories/10/sub-categories'
    ];
    for (const ep of endpoints) {
        console.log(`Trying ${ep}...`);
        const res = await fetch(`${BASE_URL}${ep}`, {
            headers: { 'MicroworkersApiKey': API_KEY }
        });
        if (res.ok) {
            console.log(`✅ Success for ${ep}`);
            const data = await res.json();
            console.log(JSON.stringify(data, null, 2).substring(0, 200));
        } else {
            console.log(`❌ Failed ${res.status}`);
        }
    }
}
test();
