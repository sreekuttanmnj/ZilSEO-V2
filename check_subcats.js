const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const BASE_URL = 'https://ttv.microworkers.com/api/v2';

async function listAll() {
    const res = await fetch(`${BASE_URL}/basic-categories`, {
        headers: { 'MicroworkersApiKey': API_KEY }
    });
    const data = await res.json();
    const items = data.items || data;
    const cat10 = items.find(c => String(c.id) === '10');
    if (cat10) {
        console.log(`Cat ID: ${cat10.id} | ${cat10.title}`);
        if (cat10.subCategories) {
            cat10.subCategories.forEach(sub => {
                console.log(`  SubCat ID: ${sub.id} | ${sub.title}`);
            });
        } else {
            console.log('  No subcategories found for ID 10');
        }
    } else {
        console.log('Category 10 not found');
    }
}
listAll();
