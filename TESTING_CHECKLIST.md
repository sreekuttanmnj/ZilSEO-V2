# ✅ Microworkers Integration Checklist

## Pre-Flight Checks

### 1. Files Updated
- [x] `server.js` - Backend proxy with v2 API endpoints
- [x] `services/mockService.ts` - Frontend service with correct payloads
- [x] `microworkers-api-guide.md` - Complete API documentation
- [x] `test-mw-api.js` - API testing script
- [x] `MICROWORKERS_FIXES.md` - Summary of changes
- [x] `QUICK_START.md` - User guide
- [x] `ARCHITECTURE.md` - System architecture diagrams

### 2. API Endpoints Configured
- [x] Categories: `GET /v2/basic-campaigns/configuration`
- [x] Templates: `POST /v2/templates`
- [x] Campaigns: `POST /v2/basic-campaigns`
- [x] Restart: `POST /v2/basic-campaigns/:campaignId/restart`

### 3. Payload Structure Fixed
- [x] Template uses `htmlCode`, `cssSection`, `jsSection`, `title`
- [x] Campaign includes all required fields:
  - [x] `categoryId`
  - [x] `paymentPerTask`
  - [x] `availablePositions`
  - [x] `minutesToFinish`
  - [x] `ttr`
  - [x] `speed`
  - [x] `internationalZone` or `targetedZone`
  - [x] `internalTemplate` configuration
  - [x] `qtRequired`
  - [x] `autoSkipTask`
  - [x] `maximumJobLimit`
  - [x] `tasks`
  - [x] `notificationSettings`

## Testing Checklist

### Phase 1: API Direct Test
```bash
node test-mw-api.js YOUR_API_KEY
```

**Expected Results:**
- [ ] ✅ Categories fetched successfully
- [ ] ✅ Template created (receives template ID)
- [ ] ✅ Campaign created (receives campaign ID)
- [ ] ✅ No errors in console

**If Failed:**
- [ ] Check API key is correct
- [ ] Check internet connection
- [ ] Check Microworkers API status
- [ ] Review error message in console

---

### Phase 2: Backend Server Test

**Start Server:**
```bash
node server.js
```

**Health Check:**
```bash
curl http://localhost:3001/health
```

**Expected Results:**
- [ ] ✅ Server starts on port 3001
- [ ] ✅ Health endpoint returns `{"status":"ok"}`
- [ ] ✅ No errors in console

**If Failed:**
- [ ] Check port 3001 is not in use
- [ ] Check Node.js version (18+)
- [ ] Review server console logs

---

### Phase 3: Frontend Integration Test

**Prerequisites:**
- [ ] Backend server running on port 3001
- [ ] Frontend application running
- [ ] Test page/post with required fields

**Steps:**

1. **Configure Connection**
   - [ ] Go to Admin > Server Connection
   - [ ] Set Backend URL: `http://localhost:3001`
   - [ ] Set MW API Key: `YOUR_KEY`
   - [ ] Click "Save Connection"
   - [ ] Verify: No error messages

2. **Prepare Test Content**
   - [ ] Go to Pages tab
   - [ ] Select a page (or create new)
   - [ ] Fill in required fields:
     - [ ] Keyword: e.g., "online check writer"
     - [ ] Page Position: e.g., "1"
     - [ ] Result Text: e.g., "Print Checks Instantly"
   - [ ] Save changes

3. **Create Campaign**
   - [ ] Click the toggle button to start campaign
   - [ ] Wait for loading spinner
   - [ ] Expected: ✅ Toggle turns green (Running)
   - [ ] Expected: ✅ Success message appears
   - [ ] Check browser console for logs:
     - [ ] "Step 0: Fetching Category ID..."
     - [ ] "Using Category ID: ..."
     - [ ] "Step 1: Creating Template via Proxy..."
     - [ ] "Template Created. ID: ..."
     - [ ] "Step 2: Creating Campaign via Proxy..."

4. **Verify Campaign**
   - [ ] Go to Campaigns tab
   - [ ] Find your campaign in the list
   - [ ] Verify details:
     - [ ] Correct title
     - [ ] Status: Running
     - [ ] Correct keyword
   - [ ] Toggle to pause
   - [ ] Expected: Status changes to Paused

**If Failed:**
- [ ] Check browser console for errors
- [ ] Check backend server console for errors
- [ ] Verify all required fields are filled
- [ ] Verify backend URL is correct in Admin settings
- [ ] Verify MW API key is correct

---

### Phase 4: Error Handling Test

**Missing Keyword:**
- [ ] Clear keyword field
- [ ] Try to start campaign
- [ ] Expected: Error "Search Query/Keyword is required"

**Missing Result Text:**
- [ ] Clear result text field
- [ ] Try to start campaign
- [ ] Expected: Error "Result Text is required"

**Invalid Backend URL:**
- [ ] Admin > Set wrong backend URL
- [ ] Try to start campaign
- [ ] Expected: Network error message
- [ ] Expected: Falls back to mock mode (mock_mw_...)

**Invalid API Key:**
- [ ] Admin > Set wrong API key
- [ ] Try to start campaign
- [ ] Expected: 401 Unauthorized error

---

## Production Checklist

Before deploying to production:

- [ ] Update `MW_BASE_URL` to production endpoint
- [ ] Use production API key
- [ ] Deploy backend to public URL (not localhost)
- [ ] Update frontend Admin settings with production backend URL
- [ ] Test full flow in production environment
- [ ] Verify campaigns appear in Microworkers dashboard
- [ ] Monitor first few campaigns for issues
- [ ] Set up error logging/monitoring

---

## Troubleshooting Guide

### Issue: "Backend URL Not Configured"
**Solution:**
- Go to Admin > Server Connection
- Enter backend URL
- Save settings

### Issue: "Network Error: Cannot connect to backend"
**Solution:**
- Verify backend server is running: `node server.js`
- Check backend URL is correct
- Check port is not blocked by firewall

### Issue: "MW Template Error: ..."
**Possible Causes:**
1. HTML contains invalid syntax
2. Template title is missing
3. API key lacks template creation permission

**Solution:**
- Review error details in console
- Validate HTML structure
- Check API key permissions

### Issue: "MW Campaign Error: ..."
**Possible Causes:**
1. Invalid category ID
2. Missing required fields
3. Template ID doesn't exist
4. Payment too low (< $0.10)

**Solution:**
- Review violation details in console
- Check all required fields are populated
- Verify template was created successfully

### Issue: Campaign created but not visible in MW dashboard
**Possible Causes:**
1. Using sandbox key (check sandbox.microworkers.com)
2. Campaign is in draft status
3. API response didn't include correct ID

**Solution:**
- Check sandbox vs production
- Log campaign response to verify ID
- Check campaign status in response

---

## API Response Reference

### Successful Template Creation (201)
```json
{
  "id": "abc123",
  "title": "Google: Search + Visit + Share",
  "htmlCode": "...",
  "questions": [],
  "variables": [],
  "createdAt": "2025-12-25T10:00:00Z"
}
```

### Successful Campaign Creation (202)
```json
{
  "id": "camp_xyz",
  "title": "Google: Search + Visit + Share",
  "status": "pending",
  "categoryId": "1001",
  "availablePositions": 30,
  "paymentPerTask": 0.15,
  ...
}
```

### Validation Error (400)
```json
{
  "type": "validation",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Request validation failed",
  "violations": [
    {
      "pointer": "/categoryId",
      "title": "Invalid Category",
      "detail": "Category '999' does not exist"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "type": "authentication",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Invalid API key"
}
```

---

## Success Criteria

All tests should pass:
- [x] Direct API test succeeds
- [x] Backend server starts and responds
- [x] Frontend can create templates
- [x] Frontend can create campaigns
- [x] Campaigns appear in Campaigns tab
- [x] Toggle pause/resume works
- [x] Error handling works correctly
- [x] Console shows detailed logs

---

## Support & Documentation

- **API Guide**: `microworkers-api-guide.md`
- **Quick Start**: `QUICK_START.md`
- **Architecture**: `ARCHITECTURE.md`
- **Fix Summary**: `MICROWORKERS_FIXES.md`
- **Official Docs**: https://docs.microworkers.com/

---

Last Updated: 2025-12-25
