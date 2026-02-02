const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';

async function checkCampaigns() {
    const res = await fetch('https://ttv.microworkers.com/api/v2/basic-campaigns', {
        headers: { 'MicroworkersApiKey': API_KEY }
    });
    const data = await res.json();
    console.log(JSON.stringify(data.items.slice(0, 2), null, 2));
}

checkCampaigns();
