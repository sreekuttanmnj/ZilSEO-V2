// Detailed test to see the full JSON of categories
const BASE_URL = 'http://localhost:3001';

async function testCategoriesDetailed() {
    try {
        console.log('Fetching detailed category data...\n');

        const response = await fetch(`${BASE_URL}/api/mw/categories`, {
            headers: {
                'x-mw-user-key': '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d'
            }
        });

        if (!response.ok) {
            console.log('❌ Failed:', response.status);
            return;
        }

        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testCategoriesDetailed();
