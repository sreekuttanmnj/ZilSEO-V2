const API_KEY = '57558949e5612c44931103f0acee6887c12213afa45c10b472d1d8150b04a48d';

async function testTemplateCreation() {
    console.log('Step 1: Testing categories endpoint...');
    try {
        const catRes = await fetch('http://localhost:3001/api/mw/categories', {
            headers: { 'X-MW-User-Key': API_KEY }
        });
        console.log('Categories Status:', catRes.status);
        const catData = await catRes.json();
        console.log('Categories:', JSON.stringify(catData, null, 2).substring(0, 300));
    } catch (e) {
        console.log('Categories Error:', e.message);
    }

    console.log('\nStep 2: Testing template creation...');
    try {
        const templateRes = await fetch('http://localhost:3001/api/mw/templates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-MW-User-Key': API_KEY
            },
            body: JSON.stringify({
                title: 'Test Template - December 27',
                htmlCode: '<div class="panel panel-primary"><div class="panel-heading"><strong>Test Task</strong></div><div class="panel-body"><p>This is a test task</p><input class="form-control" name="answer" type="text" required /></div></div>',
                cssSection: '',
                jsSection: ''
            })
        });
        console.log('Template Status:', templateRes.status);
        const templateData = await templateRes.text();
        console.log('Template Response:', templateData);
    } catch (e) {
        console.log('Template Error:', e.message);
    }
}

testTemplateCreation();
