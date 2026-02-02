// Quick test to verify sandbox API is working
const BASE_URL = 'http://localhost:3001';

async function test() {
    try {
        console.log('Testing backend connection...\n');

        // Test 1: Health check
        console.log('1. Health Check');
        const health = await fetch(`${BASE_URL}/health`);
        const healthData = await health.json();
        console.log('✅ Server is running');
        console.log('Status:', healthData.status);
        console.log();

        // Test 2: Fetch categories
        console.log('2. Fetching Categories');
        const categoriesRes = await fetch(`${BASE_URL}/api/mw/categories`, {
            headers: {
                'x-mw-user-key': '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d'
            }
        });

        if (!categoriesRes.ok) {
            const error = await categoriesRes.text();
            console.log('❌ Categories failed:', error.substring(0, 200));
            return;
        }

        const categories = await categoriesRes.json();
        console.log('✅ Categories fetched:', categories.items?.length || 0, 'items');
        if (categories.items?.[0]) {
            console.log('  First category:', categories.items[0].title, `(ID: ${categories.items[0].id})`);
        }
        console.log();

        console.log('🎉 Backend is configured correctly!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

test();
