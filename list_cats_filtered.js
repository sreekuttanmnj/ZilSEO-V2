const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const BASE_URL = 'https://ttv.microworkers.com/api/v2';

async function listAll() {
    const res = await fetch(`${BASE_URL}/basic-categories`, {
        headers: { 'MicroworkersApiKey': API_KEY }
    });
    const data = await res.json();
    const items = data.items || data;
    items.forEach(cat => {
        if (cat.title.includes('SEO') || cat.title.includes('Social') || cat.title.includes('Data')) {
            console.log(`Cat ID: ${cat.id} | ${cat.title}`);
            if (cat.subCategories) {
                cat.subCategories.forEach(sub => {
                    console.log(`  SubCat ID: ${sub.id} | ${sub.title}`);
                });
            }
        }
    });
}
listAll();
