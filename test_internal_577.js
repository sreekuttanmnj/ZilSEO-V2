import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.MW_API_KEY || '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';
const BASE_URL = (process.env.MW_BASE_URL || 'https://ttv.microworkers.com/api/v2').replace(/\/$/, '');

console.log('--- Testing Internal Campaign Creation (Category 577) ---');
console.log('API Key:', API_KEY.substring(0, 10) + '...');
console.log('Base URL:', BASE_URL);

async function test() {
    try {
        // 1. Create Template
        console.log('\nStep 1: Creating Template...');
        const templatePayload = {
            title: 'Test Internal Template - 577',
            htmlCode: '<div class="panel panel-primary"><div class="panel-heading"><strong>Task</strong></div><div class="panel-body"><p>Go to Google and search for "ZilSEO".</p></div></div>',
            cssSection: '',
            jsSection: ''
        };

        const tRes = await fetch(`${BASE_URL}/templates`, {
            method: 'POST',
            headers: {
                'MicroworkersApiKey': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(templatePayload)
        });

        const tText = await tRes.text();
        let tData;
        try { tData = JSON.parse(tText); } catch (e) {
            console.log('Template Error (Not JSON):', tText.substring(0, 200));
            return;
        }

        if (!tRes.ok) {
            console.log('Template Creation Failed:', tData);
            return;
        }

        const templateId = tData.id;
        console.log('Template Created ID:', templateId);

        // 2. Create Campaign
        console.log('\nStep 2: Creating Campaign (Category 577)...');
        const campaignPayload = {
            title: 'Internal Campaign Test 577',
            description: 'Visit ZilSEO and search keywords',
            categoryId: '577',
            availablePositions: 30,
            minutesToFinish: 15,
            paymentPerTask: 0.06,
            speed: 1000,
            ttr: 7,
            internationalZone: { id: "int", excludedCountries: [] },
            internalTemplate: {
                id: templateId,
                ratingMethodId: 3
            },
            qtRequired: false
        };

        const cRes = await fetch(`${BASE_URL}/basic_campaigns`, {
            method: 'POST',
            headers: {
                'MicroworkersApiKey': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(campaignPayload)
        });

        const cText = await cRes.text();
        let cData;
        try { cData = JSON.parse(cText); } catch (e) {
            console.log('Campaign Error (Not JSON):', cText.substring(0, 200));
            return;
        }

        if (!cRes.ok) {
            console.log('Campaign Creation Failed:', cData);
            if (cData.errors) {
                console.log('Validation Errors:', JSON.stringify(cData.errors, null, 2));
            }
        } else {
            console.log('✅ Campaign Created Successfully!', cData);
        }

    } catch (e) {
        console.error('Test Error:', e.message);
    }
}

test();
