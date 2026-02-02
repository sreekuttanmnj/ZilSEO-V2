// Test script to check backend GSC configuration
// Run with: node test-backend-config.js

async function testBackend() {
    try {
        const response = await fetch('http://localhost:3001/health');
        const data = await response.json();

        console.log('=== Backend Health Check ===\n');
        console.log('Status:', data.status);
        console.log('Timestamp:', data.timestamp);
        console.log('\nGoogle OAuth Configuration:');
        console.log('  Client ID configured:', data.googleConfig.clientId);
        console.log('  Client Secret configured:', data.googleConfig.clientSecret);
        console.log('  Redirect URI:', data.googleConfig.redirectUri);

        if (data.googleConfig.warning) {
            console.log('\n⚠️  WARNING:', data.googleConfig.warning);
            console.log('\n📝 Action Required:');
            console.log('   1. Add GOOGLE_CLIENT_SECRET to your .env.local file');
            console.log('   2. Get it from: https://console.cloud.google.com/apis/credentials');
            console.log('   3. Restart the backend server');
            console.log('   4. Reconnect Google Search Console\n');
        } else {
            console.log('\n✅ Backend is properly configured!\n');
        }

    } catch (error) {
        console.error('❌ Failed to connect to backend:', error.message);
        console.log('\n📝 Make sure the backend server is running:');
        console.log('   node server.js\n');
    }
}

testBackend();
