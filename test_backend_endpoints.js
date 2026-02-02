const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';

async function testBackend() {
    console.log('Testing backend health...');
    try {
        const healthRes = await fetch('http://localhost:3001/health');
        console.log('Health Status:', healthRes.status);
        const health = await healthRes.json();
        console.log('Health Response:', JSON.stringify(health, null, 2));
    } catch (e) {
        console.log('Health Error:', e.message);
    }

    console.log('\nTesting categories endpoint...');
    try {
        const catRes = await fetch('http://localhost:3001/api/mw/categories', {
            headers: { 'X-MW-User-Key': API_KEY }
        });
        console.log('Categories Status:', catRes.status);
        const catText = await catRes.text();
        console.log('Categories Response:', catText.substring(0, 200));
    } catch (e) {
        console.log('Categories Error:', e.message);
    }

    console.log('\nTesting template creation...');
    try {
        const templateRes = await fetch('http://localhost:3001/api/mw/templates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-MW-User-Key': API_KEY
            },
            body: JSON.stringify({
                title: 'Test Template',
                htmlCode: '<div>Test</div>',
                cssSection: '',
                jsSection: ''
            })
        });
        console.log('Template Status:', templateRes.status);
        const templateText = await templateRes.text();
        console.log('Template Response:', templateText.substring(0, 500));
    } catch (e) {
        console.log('Template Error:', e.message);
    }
}

testBackend();
