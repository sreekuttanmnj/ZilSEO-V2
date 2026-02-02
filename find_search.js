const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const BASE_URL = 'https://ttv.microworkers.com/api/v2';

async function findSearch() {
    const res = await fetch(`${BASE_URL}/basic-categories`, {
        headers: { 'MicroworkersApiKey': API_KEY }
    });
    const data = await res.json();
    const items = data.items || data;

    console.log('--- Search/Traffic Categories ---');
    items.forEach(cat => {
        const title = (cat.title || '').toLowerCase();
        if (title.includes('search') || title.includes('traffic') || title.includes('click')) {
            console.log(`[CAT] ${cat.id}: ${cat.title}`);
        }
    });
}
findSearch();
