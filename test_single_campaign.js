const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const campaignId = 'aea191818bb0';

async function testSingle() {
    const variants = [
        `https://ttv.microworkers.com/api/v2/basic-campaigns/${campaignId}`,
        `https://ttv.microworkers.com/api/v2/basic_campaigns/${campaignId}`,
        `https://ttv.microworkers.com/api/v2/basic-campaigns/details/${campaignId}`,
        `https://ttv.microworkers.com/api/v2/campaigns/${campaignId}`
    ];

    for (const url of variants) {
        console.log(`Testing: ${url}`);
        try {
            const res = await fetch(url, {
                headers: { 'MicroworkersApiKey': API_KEY }
            });
            console.log(`Status: ${res.status}`);
            if (res.ok) {
                const data = await res.json();
                console.log(`✅ Success! Status: ${data.status}`);
            } else {
                console.log('❌ Failed');
            }
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
    }
}

testSingle();
