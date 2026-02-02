const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const BASE_URL = 'https://ttv.microworkers.com/api/v2';

async function listAll() {
    const res = await fetch(`${BASE_URL}/basic-categories`, {
        headers: { 'MicroworkersApiKey': API_KEY }
    });
    const data = await res.json();
    const items = data.items || data;
    items.forEach(cat => {
        console.log(`[${cat.id}] ${cat.title}`);
    });
}
listAll();
