const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const urls = [
    'https://ttv.microworkers.com/api/v2/basic-campaigns/configuration',
    'https://ttv.microworkers.com/api/v2/basic_campaigns/configuration',
    'https://api.microworkers.com/api/v2/basic-campaigns/configuration',
    'https://api.microworkers.com/v2/basic-campaigns/configuration',
    'https://api.microworkers.com/api.php/v2/basic-campaigns/configuration',
    'https://www.microworkers.com/api.php/v2/basic-campaigns/configuration',
];

async function run() {
    for (const u of urls) {
        console.log(`Testing: ${u}`);
        try {
            const r = await fetch(u, { headers: { 'MicroworkersApiKey': API_KEY } });
            console.log(`  Status: ${r.status}`);
            if (r.ok) {
                const text = await r.text();
                if (text.startsWith('{')) console.log('  ✅ SUCCESS!');
            }
        } catch (e) { }
    }
}
run();
