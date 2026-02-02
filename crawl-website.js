/**
 * ZilSEO Website Crawler Script
 * Usage: node crawl-website.js <url>
 */

const url = process.argv[2];

if (!url) {
    console.error("Usage: node crawl-website.js <url>");
    process.exit(1);
}

async function crawl(targetUrl) {
    console.log(`Scanning: ${targetUrl}...`);

    try {
        const fullUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
        const domain = new URL(fullUrl).hostname;

        const response = await fetch(fullUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();

        const hrefRegex = /href="([^"#]+)"/g;
        const links = new Set();
        let match;

        while ((match = hrefRegex.exec(html)) !== null) {
            let link = match[1];
            try {
                const absolute = new URL(link, fullUrl);
                if (absolute.hostname === domain) {
                    const clean = absolute.origin + absolute.pathname.replace(/\/$/, '');
                    if (clean !== fullUrl.replace(/\/$/, '')) {
                        links.add(clean);
                    }
                }
            } catch (e) { }
        }

        console.log(`\nFound ${links.size} internal links:`);
        Array.from(links).sort().forEach(l => console.log(` - ${l}`));

        console.log("\nCopy these links and add them to your dashboard.");

    } catch (error) {
        console.error("Failed to crawl:", error.message);
    }
}

crawl(url);
