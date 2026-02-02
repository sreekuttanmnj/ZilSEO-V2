const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const url = 'https://ttv.microworkers.com/api/v2/basic-campaigns';

async function test() {
    const payload = {
        title: "Test SEO Campaign 2",
        description: "Search for ZilSeo and click",
        categoryId: 1001,
        availablePositions: 30, // Minimum required
        paymentPerTask: 0.10,
        minutesToFinish: 30,
        speed: 1000,
        ttr: 7,
        internationalZone: { id: "int", excludedCountries: [] },
        internalTemplate: {
            id: "T685131442c9f8",
            ratingMethodId: 3,
            numberOfFileProofs: 1,
            allowedFileTypes: null
        },
        qtRequired: false
    };

    console.log('Sending payload...');
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'MicroworkersApiKey': API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    console.log('Status:', res.status);
    const data = await res.json();
    if (res.ok) {
        console.log('✅ SUCCESS! Campaign ID:', data.id);
    } else {
        console.log('❌ FAILED');
        console.log(JSON.stringify(data, null, 2));
    }
}
test();
