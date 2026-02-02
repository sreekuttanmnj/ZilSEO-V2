const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const url = 'https://ttv.microworkers.com/api/v2/basic-categories';

async function test() {
    const res = await fetch(url, { headers: { 'MicroworkersApiKey': API_KEY } });
    const data = await res.json();
    const items = data.items || data;
    items.forEach(c => {
        console.log(`ID: "${c.id}" | Title: "${c.title}"`);
    });
}
test();
