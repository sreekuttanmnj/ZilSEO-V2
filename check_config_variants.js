const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const BASE_URL = 'https://ttv.microworkers.com/api/v2';

async function checkConfig() {
    const urls = [
        `${BASE_URL}/basic-campaigns/configuration`,
        `${BASE_URL}/basic_campaigns/configuration`
    ];
    for (const url of urls) {
        console.log(`Trying ${url}...`);
        const res = await fetch(url, {
            headers: { 'MicroworkersApiKey': API_KEY }
        });
        if (res.ok) {
            const data = await res.json();
            console.log('✅ Success!');
            const cats = data.categories || [];
            cats.forEach(c => console.log(`- ${c.id}: ${c.name || c.title}`));
            return;
        } else {
            console.log(`❌ Failed ${res.status}`);
        }
    }
}
checkConfig();
