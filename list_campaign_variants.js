const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';

async function listCampaigns() {
    const variants = [
        'https://ttv.microworkers.com/api/v2/basic-campaigns',
        'https://ttv.microworkers.com/api/v2/basic_campaigns'
    ];

    for (const url of variants) {
        console.log(`Listing: ${url}`);
        try {
            const res = await fetch(url, {
                headers: { 'MicroworkersApiKey': API_KEY }
            });
            console.log(`Status: ${res.status}`);
            if (res.ok) {
                const data = await res.json();
                console.log(`✅ Found ${(data.items || []).length} campaigns`);
                if (data.items && data.items.length > 0) {
                    console.log(`Sample ID: ${data.items[0].id}`);
                }
            } else {
                console.log('❌ Failed');
            }
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
    }
}

listCampaigns();
