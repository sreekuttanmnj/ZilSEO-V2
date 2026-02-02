const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';

async function testTemplates() {
    const urls = [
        'https://ttv.microworkers.com/api/v2/templates',
        'https://ttv.microworkers.com/api/v2/basic-templates'
    ];

    for (const url of urls) {
        console.log(`Testing: ${url}`);
        const res = await fetch(url, {
            headers: { 'MicroworkersApiKey': API_KEY }
        });
        console.log(`Status: ${res.status}`);
    }
}

testTemplates();
