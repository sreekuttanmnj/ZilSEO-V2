// Quick diagnostic script to check GSC connection status
// Run this with: node check-gsc-connection.js

const websites = JSON.parse(localStorage.getItem('zilseo_data_websites') || '[]');

console.log('=== GSC Connection Diagnostic ===\n');

websites.forEach(site => {
    console.log(`Website: ${site.name}`);
    console.log(`  URL: ${site.url}`);
    console.log(`  GSC Connected: ${site.gscConnected ? 'YES' : 'NO'}`);
    if (site.gscConnected) {
        console.log(`  GSC Email: ${site.gscEmail || 'NOT SET'}`);
        console.log(`  Access Token: ${site.accessToken ? 'SET (' + site.accessToken.substring(0, 20) + '...)' : 'NOT SET'}`);
        console.log(`  Last Scraped: ${site.lastScraped || 'NEVER'}`);
    }
    console.log('');
});

// Check if access token is in localStorage
const globalToken = localStorage.getItem('gsc_access_token');
console.log(`Global Access Token in localStorage: ${globalToken ? 'SET (' + globalToken.substring(0, 20) + '...)' : 'NOT SET'}`);
