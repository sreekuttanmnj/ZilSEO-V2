/**
 * Microworkers API Test Script
 * 
 * This script tests the Microworkers API integration by:
 * 1. Fetching available categories
 * 2. Creating a test template
 * 3. Creating a test campaign using the template
 * 
 * Usage:
 * node test-mw-api.js [YOUR_API_KEY]
 */

const API_KEY = process.argv[2] || '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const BASE_URL = 'https://www.microworkers.com/api.php';

async function fetchMW(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'MicroworkersApiKey': API_KEY,
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        console.error(`❌ Error ${response.status}:`, JSON.stringify(data));
        throw new Error(`API Error: ${response.status}`);
    }

    return data;
}

async function testAPI() {
    console.log('🚀 Testing Microworkers API Integration\n');
    console.log(`API Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 5)}\n`);

    try {
        // Step 1: Fetch Categories
        console.log('📋 Step 1: Fetching Categories...');
        const config = await fetchMW('/v2/basic-categories');
        console.log(`✅ Found ${config.items?.length || 0} categories`);

        const searchCategory = config.items?.find(c =>
            c.title.toLowerCase().includes('search') ||
            c.title.toLowerCase().includes('click')
        );
        const categoryId = searchCategory?.id || config.items?.[0]?.id || '1001';
        console.log(`   Using Category: ${searchCategory?.title || 'Default'} (ID: ${categoryId})\n`);

        // Step 2: Create Template
        console.log('📝 Step 2: Creating Test Template...');
        const templatePayload = {
            htmlCode: `<div class="panel panel-primary">
  <div class="panel-heading"><strong>Test Task</strong></div>
  <div class="panel-body">
    <p>This is a test task created via API</p>
    <label>Enter your answer:</label>
    <input class="form-control" name="answer" type="text" required />
  </div>
</div>`,
            cssSection: '',
            jsSection: '',
            title: 'API Test Template'
        };

        const template = await fetchMW('/v2/templates', {
            method: 'POST',
            body: JSON.stringify(templatePayload)
        });
        console.log(`✅ Template Created: ${template.id}`);
        console.log(`   Title: ${template.title}\n`);

        // Step 3: Create Campaign
        console.log('🎯 Step 3: Creating Test Campaign...');
        const campaignPayload = {
            title: 'API Test Campaign',
            description: 'This is a test campaign created via API',
            categoryId: categoryId,
            paymentPerTask: 0.10,
            availablePositions: 30,
            minutesToFinish: 30,
            ttr: 7,
            speed: 1000,
            internationalZone: {
                id: "int",
                excludedCountries: []
            },
            internalTemplate: {
                id: template.id,
                adminInstructions: 'Review the submitted answer',
                numberOfSubTasks: 1,
                ratingMethodId: 3,
                // displaySubTasksOnSamePage: true,
                allowedFileTypes: ['png', 'jpg'],
                numberOfFileProofs: 1
            },
            qtRequired: true,
            removePositionOnNokRating: false,
            taskOrder: 2,
            visibilityDelay: 0,
            chatEnabled: false,
            autoSkipTask: {
                enabled: false,
                timeLimit: 120
            },
            maximumJobLimit: {
                enabled: false
            },
            tasks: [],
            notificationSettings: []
        };

        const campaign = await fetchMW('/v2/basic-campaigns', {
            method: 'POST',
            body: JSON.stringify(campaignPayload)
        });

        console.log(`✅ Campaign Created: ${campaign.id}`);
        console.log(`   Title: ${campaign.title}`);
        console.log(`   Status: ${campaign.status}`);
        console.log(`   Positions: ${campaign.availablePositions}`);
        console.log(`   Payment: $${campaign.paymentPerTask}\n`);

        console.log('🎉 All tests passed successfully!\n');
        console.log('Campaign ID:', campaign.id);
        console.log('Template ID:', template.id);

    } catch (error) {
        console.error('\n❌ Test Failed:', error.message);
        process.exit(1);
    }
}

testAPI();
