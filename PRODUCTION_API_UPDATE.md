# Microworkers API Configuration - Updated to Production

## Summary of Changes

I've successfully updated your Microworkers integration to use the **production/real account API** instead of the sandbox API.

## Changes Made

### 1. Base URL Updated
**File:** `server.js` (line 24)
```javascript
// BEFORE (Sandbox):
const MW_BASE_URL = 'https://api.microworkers.com/api';

// AFTER (Production):
const MW_BASE_URL = 'https://ttv.microworkers.com/api/v2';
```

### 2. Endpoint Paths Fixed
All endpoint paths now use **underscores** instead of hyphens to match the official API v2 specification:

- ✅ `/basic_campaigns/configuration` (was `/basic-campaigns/configuration`)
- ✅ `/templates` 
- ✅ `/basic_campaigns`
- ✅ `/basic_campaigns/{id}/restart`
- ✅ `/basic_campaigns/{id}/stop`
- ✅ `/basic_campaigns/{id}/tasks`

### 3. Payment Amount
Already correctly set to **$0.06** per task (meets minimum requirement)

### 4. Campaign Payload
All null values in `internalTemplate` have been changed to empty arrays/zero:
- `allowedFileTypes: []` (was `null`)
- `numberOfFileProofs: 0` (was `null`)

## API Configuration Details

According to the official Microworkers API v2 documentation:

**Base URL:** `https://ttv.microworkers.com/api/v2`

**Required Headers:**
```
MicroworkersApiKey: YOUR_API_KEY
Content-Type: application/json
```

**Required Campaign Fields:**
- `availablePositions` (integer)
- `categoryId` (string)
- `speed` (1-1000)
- `minutesToFinish` (integer)
- `title` (string)
- `qtRequired` (boolean)
- `description` (string)
- `paymentPerTask` (float, minimum $0.06)
- `ttr` (integer, days)
- Either `internationalZone` OR `targetedZone`
- Either `internalTemplate` OR `externalTemplate`

## How to Test

1. **Restart your backend server:**
   ```bash
   # Stop the current server (Ctrl+C), then:
   node server.js
   ```

2. **In your frontend (Admin > Server Connection):**
   - Backend URL: `http://localhost:3001`
   - MW API Key: `YOUR_PRODUCTION_API_KEY`
   - Click "Save Connection"

3. **Create a test campaign:**
   - Go to Pages > Mw tab
   - Fill in required fields
   - Click toggle to start campaign
   - Check browser console for success/errors

## What This Fixes

✅ **Sandbox → Production migration complete**
✅ **Correct API endpoint structure** (underscores not hyphens)
✅ **Payment meets minimum requirement** ($0.06)
✅ **Valid payload structure** (no null values)
✅ **All endpoints updated consistently**

## Next Steps

1. Make sure your `.env.local` file has your **real** Microworkers API key:
   ```
   MW_API_KEY=YOUR_REAL_PRODUCTION_KEY
   ```

2. Restart the backend server to pick up the changes

3. Test campaign creation

4. Monitor the Microworkers dashboard to verify campaigns appear

## Troubleshooting

If you still see errors:

1. **Check your API key** - Make sure it's for a production account, not sandbox
2. **Verify backend is running** - Should show: `Backend server running on port 3001`
3. **Check console logs** - Look for specific error messages from Microworkers API
4. **Test endpoints directly:**
   ```bash
   node test_ttv_variants.js
   ```

---

**Status:** ✅ **Configuration updated for production API**

Last Updated: 2025-12-27 13:33 IST
