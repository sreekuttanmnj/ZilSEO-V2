import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

// 1. Permissive CORS for Local Development
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'MicroworkersApiKey', 'Authorization', 'X-MW-User-Key']
}));

app.use(express.json());

// 2. Configuration
// Fallback key if not provided by client
const DEFAULT_MW_API_KEY = process.env.MW_API_KEY;
// Production base URL - This is the working configuration
let MW_BASE_URL = (process.env.MW_BASE_URL || 'https://ttv.microworkers.com/api/v2').replace(/\/$/, '');

// Force ttv subdomain if api.microworkers.com is used (v2 requires ttv)
if (MW_BASE_URL.includes('api.microworkers.com')) {
    MW_BASE_URL = MW_BASE_URL.replace('api.microworkers.com', 'ttv.microworkers.com');
}

// Ensure /api/v2 is present
if (MW_BASE_URL.includes('microworkers.com') && !MW_BASE_URL.includes('/api/v2')) {
    if (!MW_BASE_URL.includes('/api')) {
        MW_BASE_URL += '/api/v2';
    } else {
        MW_BASE_URL = MW_BASE_URL.replace('/api', '/api/v2');
    }
}
console.log(`[MW] Using Base URL: ${MW_BASE_URL}`);

// 2.5 Google Search Console Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback';

const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
);

// 3. Health Check (New)
// 3. Health Check
app.get('/health', (req, res) => {
    const hasSecret = !!GOOGLE_CLIENT_SECRET;
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        googleConfig: {
            clientId: !!GOOGLE_CLIENT_ID,
            clientSecret: hasSecret,
            redirectUri: REDIRECT_URI,
            warning: !hasSecret ? 'GOOGLE_CLIENT_SECRET is not set. OAuth token exchange will fail!' : null
        }
    });
});

// 4. Scraping Proxy Endpoint
app.get('/api/scrape', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    try {
        // Native fetch (Node 18+)
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.google.com/'
            }
        });

        if (!response.ok) {
            return res.status(response.status).send(`Failed to fetch: ${response.statusText}`);
        }

        const html = await response.text();
        res.send(html);
    } catch (error) {
        console.error('Scrape error:', error);
        res.status(500).json({ error: 'Failed to fetch URL', details: error.message });
    }
});

// 4.5 Website Crawler Endpoint (New)
app.get('/api/crawl', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    try {
        const targetUrl = url.startsWith('http') ? url : `https://${url}`;
        const rootUrl = new URL(targetUrl);
        const domain = rootUrl.hostname;

        const response = await fetch(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();

        // Extract all internal links
        // Simple regex to find hrefs
        const hrefRegex = /href="([^"#]+)"/g;
        const links = new Set();
        let match;

        while ((match = hrefRegex.exec(html)) !== null) {
            let link = match[1];

            try {
                // Handle relative links
                const absolute = new URL(link, targetUrl);

                // Only same domain
                if (absolute.hostname === domain) {
                    // Filter out WP and PHP links
                    const path = absolute.pathname.toLowerCase();
                    const isWp = path.includes('/wp-') || path.includes('wp-login') || path.includes('wp-admin');
                    const isPhp = path.endsWith('.php');

                    if (!isWp && !isPhp) {
                        // Normalize: remove trailing slash and hash
                        const clean = absolute.origin + absolute.pathname.replace(/\/$/, '');
                        if (clean !== targetUrl.replace(/\/$/, '')) {
                            links.add(clean);
                        }
                    }
                }
            } catch (e) {
                // Ignore invalid URLs
            }
        }

        res.json({ links: Array.from(links) });

    } catch (error) {
        console.error('Crawl error:', error);
        res.status(500).json({ error: 'Failed to crawl website', details: error.message });
    }
});

// 5. Microworkers API Proxies
// Helper to get key
const getMwKey = (req) => {
    return req.headers['x-mw-user-key'] || req.headers['microworkersapikey'] || DEFAULT_MW_API_KEY;
};

// Get Categories (Maps to /basic-campaigns/configuration)
app.get('/api/mw/categories', async (req, res) => {
    try {
        const apiKey = getMwKey(req);
        const url = `${MW_BASE_URL}/basic-campaigns/configuration`;
        console.log(`[MW] Fetching categories from: ${url}`);

        const response = await fetch(url, {
            headers: { 'MicroworkersApiKey': apiKey }
        });

        console.log(`[MW] Response Status: ${response.status}`);
        const text = await response.text();

        if (!response.ok) {
            console.error(`[MW] API Error (${response.status}):`, text.substring(0, 500));
            try {
                const errData = JSON.parse(text);
                return res.status(response.status).json(errData);
            } catch (e) {
                return res.status(response.status).json({
                    error: 'Microworkers API Error',
                    status: response.status,
                    details: text.substring(0, 100)
                });
            }
        }

        try {
            const data = JSON.parse(text);
            res.json(data);
        } catch (e) {
            console.error('[MW] JSON Parse Error:', text.substring(0, 500));
            res.status(500).json({ error: 'Invalid JSON from Microworkers', details: text.substring(0, 100) });
        }
    } catch (error) {
        console.error('Categories Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create Template - v2 API
app.post('/api/mw/templates', async (req, res) => {
    try {
        const apiKey = getMwKey(req);

        // Map simplified payload to v2 structure
        const payload = {
            htmlCode: req.body.htmlCode || req.body.content || '',
            cssSection: req.body.cssSection || '',
            jsSection: req.body.jsSection || '',
            title: req.body.title || req.body.name || 'Untitled Template'
        };

        const url = `${MW_BASE_URL}/templates`;
        console.log(`[MW] Creating Template: ${url}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'MicroworkersApiKey': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log(`[MW] Response Status: ${response.status}`);
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('[MW] Failed to parse Template response:', text.substring(0, 500));
            return res.status(response.status).json({ error: 'Invalid response from MW API', details: text.substring(0, 100) });
        }

        if (!response.ok) {
            console.error('[MW] Template Creation Failed:', data);
        }

        res.status(response.status).json(data);
    } catch (error) {
        console.error('Template Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create Campaign - v2 API with full payload structure
app.post('/api/mw/campaigns/create', async (req, res) => {
    try {
        const apiKey = getMwKey(req);

        // Build v2 compliant payload
        const payload = {
            // Basic Campaign Info
            title: req.body.title || 'Untitled Campaign',
            description: req.body.description || 'Campaign created via API',

            // Financial
            paymentPerTask: 0.06, // Fixed fee forced by policy

            // Positions & Timing
            availablePositions: Math.max(30, Number(req.body.positions || req.body.availablePositions || 30)),
            minutesToFinish: req.body.minutes || req.body.minutesToFinish || 7,
            ttr: req.body.ttr || 7, // Time to review (days)

            // Category (REQUIRED) - Must be fetched from /basic-categories and provided by client
            categoryId: String(req.body.category || req.body.categoryId || '1001'),

            // Speed (1000 = fastest)
            speed: req.body.speed || 1000,

            // Zone Configuration (Fixed to International with No Exclusions)
            internationalZone: {
                id: "int",
                excludedCountries: []
            },

            // Template Configuration (Internal Template)
            // IMPORTANT: Only send the template ID and REQUIRED fields.
            // ratingMethodId is required (3 = Standard/Star rating).
            // Other fields (adminInstructions, numberOfSubTasks) cause "should be null" errors if sent.
            internalTemplate: {
                id: req.body.internalTemplate?.id || req.body.template || req.body.templateId,
                ratingMethodId: 3
            },

            // Additional Settings
            qtRequired: req.body.qtRequired !== undefined ? req.body.qtRequired : true,
            removePositionOnNokRating: req.body.removePositionOnNokRating || false,
            taskOrder: req.body.taskOrder || 2,
            visibilityDelay: req.body.visibilityDelay || 0,
            chatEnabled: req.body.chatEnabled || false,

            // Auto Skip Configuration
            autoSkipTask: req.body.autoSkipTask || {
                enabled: false,
                timeLimit: 120
            },

            // Job Limits - Removed to ensure no throttling
            // maximumJobLimit: { enabled: false },

            // Tasks and Notifications (empty by default)
            tasks: req.body.tasks || [],
            notificationSettings: req.body.notificationSettings || []
        };

        console.log('[MW] Creating Campaign with Payload:', JSON.stringify(payload, null, 2));

        // For basic campaigns, the endpoint MUST be /basic-campaigns
        const url = `${MW_BASE_URL}/basic-campaigns`;
        console.log(`[MW] Creating Basic Campaign via POST ${url}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'MicroworkersApiKey': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        console.log(`[MW] Create Response (${response.status}):`, text.substring(0, 1000));

        if (!response.ok) {
            // Check for specific violations
            try {
                const errData = JSON.parse(text);
                if (errData.type && errData.type.includes('handle-errors') && errData.title === 'DoesNotExist') {
                    console.error('[MW] CRITICAL: API claims resource DoesNotExist. This usually means the Category ID, Template ID, or API Endpoint is wrong.');
                    console.error(`[MW] Debug: CategoryId=${payload.categoryId}, TemplateId=${payload.internalTemplate?.id}`);
                }
            } catch (e) { }

            return res.status(response.status).send(text); // Send raw text back so client can parse
        }

        const data = JSON.parse(text);
        console.log('[MW] Campaign Created Successfully:', data.id);
        res.status(201).json(data);
    } catch (error) {
        console.error('Campaign Creation Error:', error);
        res.status(500).json({ error: error.message });
    }
});



// 6. Google Search Console Endpoints

app.get('/api/gsc/auth-url', (req, res) => {
    const { state } = req.query;
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/webmasters.readonly',
            'https://www.googleapis.com/auth/userinfo.email'
        ],
        prompt: 'consent',
        state: state
    });
    res.json({ url: authUrl });
});

app.post('/api/gsc/sites', async (req, res) => {
    const { accessToken, refreshToken } = req.body;
    if (!accessToken && !refreshToken) {
        return res.status(400).json({ error: 'accessToken or refreshToken is required' });
    }

    try {
        const auth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
        auth.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken
        });

        const searchconsole = google.searchconsole({ version: 'v1', auth });
        const response = await searchconsole.sites.list({});

        const currentTokens = auth.credentials;
        res.json({
            sites: response.data.siteEntry || [],
            _metainfo: {
                newAccessToken: currentTokens.access_token !== accessToken ? currentTokens.access_token : null
            }
        });
    } catch (error) {
        console.error('GSC List Sites Error:', error);
        res.status(500).json({ error: error.message });
    }
});


app.get('/api/gsc/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send('Code is required');

    // Check if CLIENT_SECRET is configured
    if (!GOOGLE_CLIENT_SECRET) {
        return res.status(500).json({
            error: 'GOOGLE_CLIENT_SECRET is not configured. Please add it to your .env.local file.'
        });
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Fetch user info to get email
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();

        // Return tokens along with user email
        res.json({
            ...tokens,
            email: userInfo.data.email
        });
    } catch (error) {
        console.error('GSC Callback Error:', error);
        res.status(500).json({ error: error.message });
    }
});


app.post('/api/gsc/query', async (req, res) => {
    const { siteUrl, startDate, endDate, dimensions, rowLimit, accessToken, refreshToken } = req.body;

    if (!siteUrl || (!accessToken && !refreshToken)) {
        return res.status(400).json({ error: 'siteUrl and at least one token are required' });
    }

    try {
        const auth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
        auth.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken
        });

        const searchconsole = google.searchconsole({ version: 'v1', auth });
        console.log(`[GSC] Querying: ${siteUrl}`);

        const response = await searchconsole.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                endDate: endDate || new Date().toISOString().split('T')[0],
                dimensions: dimensions || ['query', 'page'],
                rowLimit: rowLimit || 100
            },
        });

        // Check if a new access token was generated during this request
        const currentTokens = auth.credentials;
        const result = {
            ...response.data,
            _metainfo: {
                newAccessToken: currentTokens.access_token !== accessToken ? currentTokens.access_token : null
            }
        };

        console.log(`[GSC] Success: ${siteUrl} - Found ${response.data.rows?.length || 0} rows`);
        res.json(result);
    } catch (error) {
        console.error('GSC Query Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/gsc/pages', async (req, res) => {
    const { siteUrl, accessToken, refreshToken } = req.body;

    if (!siteUrl || (!accessToken && !refreshToken)) {
        return res.status(400).json({ error: 'siteUrl and at least one token are required' });
    }

    try {
        const auth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
        auth.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken
        });

        const searchconsole = google.searchconsole({ version: 'v1', auth });

        // Fetch last 90 days of indexed pages
        const response = await searchconsole.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                dimensions: ['page'],
                rowLimit: 5000
            },
        });

        const pages = (response.data.rows || []).map(row => row.keys[0]);
        console.log(`[GSC] Found ${pages.length} pages for ${siteUrl}`);

        const currentTokens = auth.credentials;
        res.json({
            pages,
            _metainfo: {
                newAccessToken: currentTokens.access_token !== accessToken ? currentTokens.access_token : null
            }
        });
    } catch (error) {
        console.error('GSC Pages Sync Error:', error);
        res.status(500).json({ error: error.message });
    }
});


// List Campaigns (Basic + Hire Group)
app.get('/api/mw/campaigns', async (req, res) => {
    try {
        const apiKey = getMwKey(req);

        const fetchList = async (path) => {
            const url = `${MW_BASE_URL}/${path}?pageSize=1000`;
            const response = await fetch(url, { headers: { 'MicroworkersApiKey': apiKey } });
            if (!response.ok) return [];
            const data = await response.json();
            return data.items || data.campaigns || [];
        };

        console.log(`[MW] Fetching all campaigns (Basic)...`);
        const [basic] = await Promise.all([
            fetchList('basic-campaigns')
            // fetchList('hire-group-campaigns') // User requested only basic
        ]);

        const all = [...basic];
        res.json({ items: all, total: all.length });
    } catch (error) {
        console.error('List Campaigns Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get Campaign Details / Status
app.get('/api/mw/campaigns/:id', async (req, res) => {
    try {
        const apiKey = getMwKey(req);
        const { id } = req.params;

        // Try Basic first
        let url = `${MW_BASE_URL}/basic-campaigns/${id}`;
        let response = await fetch(url, { headers: { 'MicroworkersApiKey': apiKey } });

        // Try Hire Group if 404
        if (!response.ok && response.status === 404) {
            url = `${MW_BASE_URL}/hire-group-campaigns/${id}`;
            response = await fetch(url, { headers: { 'MicroworkersApiKey': apiKey } });
        }

        if (!response.ok) {
            throw new Error(`MW Error: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Get Campaign Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Pause/Resume/Stop Helper
const campaignAction = async (req, res, action) => {
    try {
        const apiKey = getMwKey(req);
        const { id } = req.params;

        // Try Basic first
        let url = `${MW_BASE_URL}/basic-campaigns/${id}/${action}`;
        console.log(`[MW] ${action.toUpperCase()} (Basic): ${url}`);
        let response = await fetch(url, { method: 'PUT', headers: { 'MicroworkersApiKey': apiKey } });

        // Try Hire Group if 404
        if (!response.ok && response.status === 404) {
            url = `${MW_BASE_URL}/hire-group-campaigns/${id}/${action}`;
            console.log(`[MW] ${action.toUpperCase()} (HireGroup): ${url}`);
            response = await fetch(url, { method: 'PUT', headers: { 'MicroworkersApiKey': apiKey } });
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`MW Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(`${action} Campaign Error:`, error);
        res.status(500).json({ error: error.message });
    }
};

// Pause Campaign
app.put('/api/mw/campaigns/:id/pause', (req, res) => campaignAction(req, res, 'pause'));

// Resume Campaign
app.put('/api/mw/campaigns/:id/resume', (req, res) => campaignAction(req, res, 'resume'));

// Stop/Cancel Campaign
app.put('/api/mw/campaigns/:id/stop', (req, res) => campaignAction(req, res, 'stop'));

// Restart Campaign - v2 API uses POST
app.post('/api/mw/campaigns/:id/restart', async (req, res) => {
    try {
        const apiKey = getMwKey(req);
        const { id } = req.params;

        // Try Basic first
        let url = `${MW_BASE_URL}/basic-campaigns/${id}/restart`;
        let response = await fetch(url, {
            method: 'POST',
            headers: { 'MicroworkersApiKey': apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ positionsToAdd: req.body.positionsToAdd || 30 })
        });

        // Try Hire Group if 404
        if (!response.ok && response.status === 404) {
            url = `${MW_BASE_URL}/hire-group-campaigns/${id}/restart`;
            response = await fetch(url, {
                method: 'POST',
                headers: { 'MicroworkersApiKey': apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ positionsToAdd: req.body.positionsToAdd || 30 })
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`MW Error: ${response.status} - ${errorText || 'No detail provided'}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Restart Campaign Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update Campaign (PATCH) - For autoRefillPositions etc
app.patch('/api/mw/campaigns/:id', async (req, res) => {
    try {
        const apiKey = getMwKey(req);
        const { id } = req.params;

        // Try Basic first
        let url = `${MW_BASE_URL}/basic-campaigns/${id}`;
        let response = await fetch(url, {
            method: 'PATCH',
            headers: { 'MicroworkersApiKey': apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        // Try Hire Group if 404
        if (!response.ok && response.status === 404) {
            url = `${MW_BASE_URL}/hire-group-campaigns/${id}`;
            response = await fetch(url, {
                method: 'PATCH',
                headers: { 'MicroworkersApiKey': apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify(req.body)
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`MW Error: ${response.status} - ${errorText || 'No detail provided'}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Update Campaign Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update Template
app.put('/api/mw/templates/:id', async (req, res) => {
    try {
        const apiKey = getMwKey(req);
        const { id } = req.params;

        const payload = {
            htmlCode: req.body.htmlCode || '',
            cssSection: req.body.cssSection || '',
            jsSection: req.body.jsSection || ''
        };

        const url = `${MW_BASE_URL}/templates/${id}`;
        console.log(`[MW] Updating Template: ${url}`);

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'MicroworkersApiKey': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log(`[MW] Response Status: ${response.status}`);
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('[MW] Failed to parse Template update response:', text.substring(0, 500));
            return res.status(response.status).json({ error: 'Invalid response from MW API', details: text.substring(0, 100) });
        }

        if (!response.ok) {
            console.error('[MW] Template Update Failed:', data);
        } else {
            console.log('[MW] Template Updated Successfully:', id);
        }

        res.status(response.status).json(data);
    } catch (error) {
        console.error('Template Update Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get Campaign Tasks (Submitted Proofs)
app.get('/api/mw/campaigns/:id/tasks', async (req, res) => {
    try {
        const apiKey = getMwKey(req);
        const { id } = req.params;
        const { status, limit, offset } = req.query; // Optional filters

        const fetchFromUrl = async (path, isSlots = true) => {
            let url = `${MW_BASE_URL}/${path}`;
            const params = new URLSearchParams();

            // Map statuses for Slots API v2
            if (status) {
                let mwStatus = status; // Default to original status
                const s = status.toUpperCase();

                if (isSlots) {
                    if (s === 'SUBMITTED') mwStatus = 'NOTRATED';
                    // 'SUBMITTED' is not a valid status filter for slots, use 'NOTRATED'
                }

                if (!mwStatus || mwStatus === status) { // Only apply these if mwStatus hasn't been specifically set for slots, or is still the original
                    if (s === 'COMPLETED') mwStatus = isSlots ? 'NOTRATED' : 'SUBMITTED';
                    else if (s === 'REJECTED') mwStatus = 'NOK';
                    else if (s === 'DONE') mwStatus = 'OK';
                    else if (s === 'NEEDS_REVISION') mwStatus = 'REVISE';
                    else if (s === 'RATED' || s === 'FINISHED') mwStatus = 'OK';
                    else if (s === 'REVISION_NEEDED') mwStatus = 'REVISE';
                    // Pass-through for valid ones if already mapped
                    else if (['NOTRATED', 'NOK', 'OK', 'REVISE'].includes(s)) mwStatus = s;
                }
                params.append('status', mwStatus);
            }

            if (isSlots) {
                // Slots API v2 uses pageSize and token-based pagination
                params.append('pageSize', limit || '100');
                if (req.query.pageToken) params.append('pageToken', req.query.pageToken);
            } else {
                params.append('limit', limit || '100');
                if (offset) params.append('offset', offset);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            console.log(`[MW] Fetching tasks from ${isSlots ? 'SLOTS' : 'TASKS'}: ${url}`);
            const response = await fetch(url, {
                headers: { 'MicroworkersApiKey': apiKey }
            });

            if (!response.ok) {
                const errorText = await response.text();
                return { ok: false, status: response.status, errorText, url };
            }

            const data = await response.json();
            return { ok: true, data };
        };

        // 1. Try Slots first (TTV format)
        let result = await fetchFromUrl(`basic-campaigns/${id}/slots`, true);

        // 2. If 404 or 400, try Basic Tasks fallback
        if (!result.ok && (result.status === 404 || result.status === 400)) {
            console.log(`[MW] Slots failed, trying Basic Tasks...`);
            result = await fetchFromUrl(`basic-campaigns/${id}/tasks`, false);
        }

        // 3. If still 404, try Hire Group variant
        if (!result.ok && result.status === 404) {
            console.log(`[MW] Basic failed, trying Hire Group fallback...`);
            result = await fetchFromUrl(`hire-group-campaigns/${id}/slots`, true);
        }

        if (!result.ok) {
            console.error(`[MW] Task Fetch Failed (${result.status}) for ${result.url}:`, result.errorText);
            // Treat 404 OR 500 as empty/failed for this specific path strategy
            if (result.status === 404 || result.status === 500) {
                console.warn(`[MW] Path ${result.url} returned ${result.status}. Returning empty for this path.`);
                return res.json({ tasks: [], items: [], slots: [], total: 0 });
            }

            const errorMsg = result.errorText.includes('DoesNotExist') ? 'DoesNotExist' : result.errorText;
            return res.status(result.status).json({ error: errorMsg, status: result.status, url: result.url });
        }

        const data = result.data;
        // Normalize response: ensure both 'tasks' and 'items' are supported
        const items = data.slots || data.items || data.tasks || [];
        const total = data.total || data.count || items.length;

        console.log(`[MW] Tasks for ${id} (${status || 'ALL'}): Found ${items.length} tasks (Total: ${total})`);

        res.json({
            ...data,
            tasks: items, // Frontend expects .tasks
            total: total
        });
    } catch (error) {
        console.error('Get Tasks Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/mw/campaigns/:id/tasks/:taskId', async (req, res) => {
    try {
        const apiKey = getMwKey(req);
        const { id, taskId } = req.params;

        // Try standard slot path first (best for TTV/Answers)
        let url = `${MW_BASE_URL}/slots/${taskId}`;
        console.log(`[MW] Trying standard slot detail: ${url}`);

        let response = await fetch(url, { headers: { 'MicroworkersApiKey': apiKey } });

        if (!response.ok && response.status === 404) {
            console.log(`[MW] Basic path failed, trying hire-group-campaigns variant...`);
            url = `${MW_BASE_URL}/hire-group-campaigns/${id}/slots/${taskId}`;
            response = await fetch(url, { headers: { 'MicroworkersApiKey': apiKey } });
        }

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ error: errorText.includes('DoesNotExist') ? 'DoesNotExist' : errorText, status: response.status });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Get Task Detail Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Rate a Task (Approve/Reject/Revise)
app.put('/api/mw/campaigns/:id/tasks/:taskId/rate', async (req, res) => {
    try {
        const apiKey = getMwKey(req);
        const { id, taskId } = req.params;
        const { rating, reason, comment } = req.body;

        if (!rating) {
            return res.status(400).json({ error: 'Rating (OK/NOK/REVISE) is required' });
        }

        // Some IDs from MW are combined: {campaignId}_B_{hash}_{slotId}
        // If taskId contains underscores, we might need just the last part if /slots/ fails
        const url = `${MW_BASE_URL}/slots/${taskId}/rate`;
        const body = {
            rating,
            comment: comment || reason || 'No comment provided' // MW requires comment for NOK/REVISE
        };

        console.log(`[MW] Rating slot: ${url}`);
        console.log(`[MW] Payload: ${JSON.stringify(body)}`);

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'MicroworkersApiKey': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[MW] Task Rating Failed (${response.status}) for URL: ${url}`);
            console.error(`[MW] Details: ${errorText}`);

            // Fallback: If 404, try various paths with BOTH full ID and extracted ID
            if (response.status === 404) {
                // Heuristic: If taskId looks like "campId_Type_Hash_RealId", try extracting RealId
                const parts = taskId.split('_');
                const cleanId = parts.length > 1 ? parts[parts.length - 1] : null;
                const idsToTry = cleanId && cleanId !== taskId ? [taskId, cleanId] : [taskId];

                // Paths to try in order
                const strategies = [
                    (tid) => `${MW_BASE_URL}/basic-campaigns/${id}/slots/${tid}/rate`,
                    (tid) => `${MW_BASE_URL}/basic-campaigns/${id}/tasks/${tid}/rate`,
                    (tid) => `${MW_BASE_URL}/hire-group-campaigns/${id}/slots/${tid}/rate`
                ];

                let success = false;
                for (const strategy of strategies) {
                    for (const tid of idsToTry) {
                        const nextUrl = strategy(tid);
                        if (await tryLegacyRate(nextUrl)) {
                            success = true;
                            break;
                        }
                    }
                    if (success) return; // Exit completely if fallback worked
                }
            }

            async function tryLegacyRate(u) {
                console.log(`[MW] 404 Fallback. Trying: ${u}`);
                const legacyRes = await fetch(u, {
                    method: 'PUT',
                    headers: { 'MicroworkersApiKey': apiKey, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        rating,
                        reason: comment || reason || 'No comment provided',
                        comment: comment || reason || 'No comment provided'
                    })
                });

                if (legacyRes.ok) {
                    const d = await legacyRes.json();
                    res.json(d);
                    return true;
                }
                console.error(`[MW] Fallback failed: ${legacyRes.status}`);
                return false;
            }

            // Return error if all failed (and response wasn't sent)
            if (res.headersSent) return;

            let errorMessage = errorText;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.detail || errorData.message || (errorData.violations ? JSON.stringify(errorData.violations) : errorText);
            } catch (e) { }

            return res.status(response.status).json({ error: errorMessage, status: response.status });
        }

        const resData = await response.json().catch(() => ({}));
        res.json({ success: true, data: resData });
    } catch (error) {
        console.error('Rate Task Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`NOTE: If you are using a sandbox (StackBlitz/CodeSandbox), copy the Public URL for port ${PORT} and paste it into the Dashboard Admin > Server Connection settings.`);
});