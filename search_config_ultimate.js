const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const BASE_URL = 'https://ttv.microworkers.com/api/v2';

async function test() {
    const variants = [
        '/basic-campaigns/configuration',
        '/basic-campaign-configuration',
        '/basic_campaigns/configuration',
        '/basic_campaign_configuration',
        '/configuration',
        '/config',
        '/basic-campaigns-config'
    ];
    for (const v of variants) {
        console.log(`Trying ${v}...`);
        const res = await fetch(`${BASE_URL}${v}`, {
            headers: { 'MicroworkersApiKey': API_KEY }
        });
        if (res.ok) {
            console.log(`✅ Success for ${v}`);
            return;
        } else {
            console.log(`❌ Failed ${res.status}`);
        }
    }
}
test();
