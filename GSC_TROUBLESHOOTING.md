# GSC Connection Troubleshooting Guide

## Issue: Connection works but no data shows on dashboard

### Step 1: Check Backend Server Status
```powershell
curl http://localhost:3001/health
```

Look for the `warning` field in the response. If it says "GOOGLE_CLIENT_SECRET is not set", you need to add it to `.env.local`.

### Step 2: Add GOOGLE_CLIENT_SECRET to .env.local

The `.env.local` file should contain:
```
GOOGLE_CLIENT_ID=942118569270-m4g4ve0m8msgavauhfkpgdcq76tch116.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_SECRET_HERE
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
```

**To get your GOOGLE_CLIENT_SECRET:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find the OAuth 2.0 Client ID that matches the Client ID above
3. Click on it and copy the "Client secret"
4. Paste it into `.env.local`

### Step 3: Restart Backend Server

After updating `.env.local`, restart the backend:
1. Stop the current `node server.js` process (Ctrl+C in the terminal)
2. Run `node server.js` again

### Step 4: Reconnect Google Search Console

If you already connected GSC before adding the secret:
1. Go to the SEO Performance page
2. Click "Disconnect" (logout icon next to your email)
3. Click "Connect Search Console" again
4. Complete the OAuth flow

### Step 5: Verify Data is Loading

After reconnecting:
1. The dashboard should show:
   - Total Clicks
   - Total Impressions
   - Average CTR
   - Average Position
   - Charts and tables with your GSC data

2. If you see "Authentication failed. Your access token may have expired or is invalid", it means the token exchange failed (likely due to missing CLIENT_SECRET).

### Common Issues

**"Failed to initialize Google Sign-In"**
- Backend server is not running
- Solution: Run `node server.js`

**"Connection Issue: Authentication failed"**
- GOOGLE_CLIENT_SECRET is not set or incorrect
- Solution: Follow Step 2 above

**Data shows initially but then shows authentication error**
- Access token has expired (tokens expire after ~1 hour)
- Solution: Disconnect and reconnect GSC

**No data but no error messages**
- Website URL might not match GSC property URL
- Check browser console (F12) for errors
- Try using the sc-domain format in your website URL
