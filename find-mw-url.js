// Comprehensive Microworkers API URL Finder
const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';

const COMBINATIONS = [
    // Sandbox variations
    {
        base: 'https://sandbox.microworkers.com', paths: [
            '/api/v2/basic-campaigns/configuration',
            '/api.php/v2/basic-campaigns/configuration',
            '/v2/basic-campaigns/configuration',
            '/api/basic-campaigns/configuration',
        ]
    },
    // Production variations
    {
        base: 'https://ttv.microworkers.com', paths: [
            '/api/v2/basic-campaigns/configuration',
            '/api.php/v2/basic-campaigns/configuration',
            '/v2/basic-campaigns/configuration',
        ]
    },
    // Alternative sandbox
    {
        base: 'https://api-sandbox.microworkers.com', paths: [
            '/v2/basic-campaigns/configuration',
            '/api/v2/basic-campaigns/configuration',
        ]
    },
];

async function testURL(fullUrl) {
    try {
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'MicroworkersApiKey': API_KEY,
                'Accept': 'application/json'
            }
        });

        const text = await response.text();
        const isJson = text.startsWith('{') || text.startsWith('[');

        return {
            url: fullUrl,
            status: response.status,
            isJson,
            preview: text.substring(0, 100),
            success: response.ok && isJson
        };
    } catch (error) {
        return {
            url: fullUrl,
            status: 'ERROR',
            error: error.message,
            success: false
        };
    }
}

async function main() {
    console.log('🔍 Testing all Microworkers API URL combinations...\n');

    const results = [];

    for (const combo of COMBINATIONS) {
        for (const path of combo.paths) {
            const fullUrl = combo.base + path;
            console.log(`Testing: ${fullUrl}`);
            const result = await testURL(fullUrl);
            results.push(result);

            if (result.success) {
                console.log(`  ✅ SUCCESS! Status: ${result.status}`);
            } else {
                console.log(`  ❌ Status: ${result.status} ${result.error || ''}`);
            }
        }
        console.log('');
    }

    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY OF RESULTS');
    console.log('='.repeat(80) + '\n');

    const successful = results.filter(r => r.success);

    if (successful.length > 0) {
        console.log('✅ WORKING ENDPOINTS:\n');
        successful.forEach(r => {
            console.log(`   ${r.url}`);
            console.log(`   Status: ${r.status}`);
            console.log(`   Preview: ${r.preview}`);
            console.log('');
        });

        // Extract base URL from first successful endpoint
        const workingUrl = successful[0].url;
        const configPath = '/v2/basic-campaigns/configuration';
        const baseUrl = workingUrl.replace(configPath, '');

        console.log('\n🎯 USE THIS IN server.js:');
        console.log(`   const MW_BASE_URL = '${baseUrl}';`);

    } else {
        console.log('❌ NO WORKING ENDPOINTS FOUND\n');
        console.log('Possible issues:');
        console.log('1. API key is invalid or expired');
        console.log('2. Network/firewall blocking requests');
        console.log('3. Microworkers API structure has changed');
        console.log('\nAll tested combinations:');
        results.forEach(r => {
            console.log(`   ${r.url} -> ${r.status}`);
        });
    }
}

main();
