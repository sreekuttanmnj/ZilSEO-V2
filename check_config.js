const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const BASE_URL = 'https://ttv.microworkers.com/api/v2';

async function checkConfig() {
    const res = await fetch(`${BASE_URL}/basic-campaigns/configuration`, {
        headers: { 'MicroworkersApiKey': API_KEY }
    });
    if (!res.ok) {
        console.log('Error:', res.status, await res.text());
        return;
    }
    const data = await res.json();
    console.log('--- Configuration Categories ---');
    const cats = data.categories || [];
    cats.forEach(cat => {
        console.log(`ID: ${cat.id} | Name: ${cat.name || cat.title}`);
    });
}
checkConfig();
