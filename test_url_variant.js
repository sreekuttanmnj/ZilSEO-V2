const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const campaignId = '6a7bbb3b4a48f'; // From previous success

async function testStatus() {
    const variants = [
        `https://ttv.microworkers.com/api/v2/basic-campaigns/${campaignId}`,
        `https://ttv.microworkers.com/api/v2/basic_campaigns/${campaignId}`
    ];

    for (const url of variants) {
        console.log(`Testing: ${url}`);
        const res = await fetch(url, {
            headers: { 'MicroworkersApiKey': API_KEY }
        });
        console.log(`Status: ${res.status}`);
        if (res.ok) {
            console.log('✅ Success!');
        } else {
            console.log('❌ Failed');
        }
    }
}

testStatus();
