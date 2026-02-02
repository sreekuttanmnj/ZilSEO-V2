const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const URL = 'https://ttv.microworkers.com/api/v2/basic-campaigns/configuration';

async function getCategories() {
    console.log('Fetching categories from:', URL);
    try {
        const res = await fetch(URL, { headers: { 'MicroworkersApiKey': API_KEY } });
        console.log('Status:', res.status);
        const data = await res.json();

        if (data.categories) {
            console.log('Found', data.categories.length, 'categories');
            const cat577 = data.categories.find(c => String(c.id) === '577');
            if (cat577) {
                console.log('✅ Category 577 found:', cat577);
            } else {
                console.log('❌ Category 577 NOT found in the list!');
                console.log('Sample categories:', data.categories.slice(0, 5));
            }
        } else {
            console.log('No categories in response');
            console.log('Full response:', JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.log('Error:', e.message);
    }
}

getCategories();
