# Microworkers API - Reverted to Sandbox Configuration

## Summary

Successfully reverted the Microworkers API configuration from **production** back to **sandbox** as requested.

## Changes Made

### 1. Base URL Reverted
**File:** `server.js` (line 24)

```javascript
// BEFORE (Production):
let MW_BASE_URL = (process.env.MW_BASE_URL || 'https://ttv.microworkers.com/api/v2').replace(/\/$/, '');
// + additional URL normalization logic

// AFTER (Sandbox):
const MW_BASE_URL = (process.env.MW_BASE_URL || 'https://api.microworkers.com/api').replace(/\/$/, '');
```

### 2. Endpoint Paths Reverted
All endpoint paths now use **hyphens** instead of underscores to match the sandbox API:

- ✅ `/basic-categories` (was `/basic-categories` - no change needed)
- ✅ `/templates` (no change needed)
- ✅ `/basic-campaigns` (was `/basic_campaigns`)
- ✅ `/basic-campaigns/{id}` (was `/basic_campaigns/{id}`)
- ✅ `/basic-campaigns/{id}/restart` (was `/basic_campaigns/{id}/restart`)
- ✅ `/basic-campaigns/{id}/stop` (no change needed - already had hyphens)
- ✅ `/basic-campaigns/{id}/tasks` (was `/basic_campaigns/{id}/tasks`)

### 3. URL Normalization Logic Removed
Removed the production-specific URL normalization logic that:
- Forced `ttv.` subdomain
- Ensured `/api/v2` path structure

## API Configuration

**Current Base URL:** `https://api.microworkers.com/api`

**Required Headers:**
```
MicroworkersApiKey: YOUR_SANDBOX_API_KEY
Content-Type: application/json
```

## Server Status

✅ Backend server restarted on port 3001  
✅ Using sandbox API URL  
✅ All endpoints updated to use hyphens  

## How to Use

1. **Server is already running** on port 3001
   - If you need to restart it: `node server.js`

2. **In your frontend (Admin > Server Connection):**
   - Backend URL: `http://localhost:3001`
   - MW API Key: `YOUR_SANDBOX_API_KEY`
   - Click "Save Connection"

3. **Create campaigns** as normal - they will now go to the sandbox environment

## What This Means

- All campaigns will be created in the **sandbox/test environment**
- You can test without affecting your production account
- Sandbox campaigns may have different limits or restrictions
- API key should be your sandbox API key, not production

## To Switch Back to Production

If you need to switch back to production in the future, refer to `PRODUCTION_API_UPDATE.md` for the production configuration.

---

**Status:** ✅ **Reverted to Sandbox API Configuration**

Last Updated: 2025-12-27 15:07 IST
