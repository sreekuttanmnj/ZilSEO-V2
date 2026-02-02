const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const bases = [
    'https://ttv.microworkers.com/api/v2',
    'https://ttv.microworkers.com/api',
    'https://api.microworkers.com/api/v2',
    'https://www.microworkers.com/api/v2'
];
const paths = [
    '/basic-campaigns/configuration',
    '/basic_campaigns/configuration',
    '/basic_categories'
];

async function scan() {
    for (const b of bases) {
        for (const p of paths) {
            const url = b + p;
            try {
                const res = await fetch(url, { headers: { 'MicroworkersApiKey': API_KEY } });
                console.log(`${url} -> ${res.status}`);
                if (res.ok) {
                    const text = await res.text();
                    if (text.startsWith('{')) {
                        console.log('  ✅ SUCCESS!');
                        // console.log('  ' + text.substring(0, 100));
                    }
                }
            } catch (e) { }
        }
    }
}
scan();
