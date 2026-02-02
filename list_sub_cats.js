const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const url = 'https://ttv.microworkers.com/api/v2/basic-categories';

async function test() {
    const res = await fetch(url, {
        headers: {
            'MicroworkersApiKey': API_KEY
        }
    });
    const data = await res.json();
    const items = data.items || data;
    const withSub = items.filter(c => c.subCategories && c.subCategories.length > 0);
    console.log(`Found ${withSub.length} categories with subcategories`);
    withSub.forEach(c => {
        console.log(`- [${c.id}] ${c.title} (${c.subCategories.length} subs)`);
    });
}
test();
