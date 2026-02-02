// Test to see what categories are available
const BASE_URL = 'http://localhost:3001';

async function testCategories() {
    try {
        console.log('Fetching available categories...\n');

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
        const categories = data.items || data.categories || [];

        console.log(`✅ Found ${categories.length} categories:\n`);
        categories.forEach((cat, index) => {
            console.log(`${index + 1}. ID: ${cat.id} - "${cat.title}"`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testCategories();
