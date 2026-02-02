# Microworkers API Payload Fixes - Summary

## What Was Fixed

I've fixed the API payloads to match the official Microworkers v2 API specification. The integration now properly creates campaigns through templates.

## Key Changes

### 1. Backend Server (`server.js`)
**Updated API Endpoints:**
- ✅ Categories: `GET /v2/basic-campaigns/configuration`
- ✅ Templates: `POST /v2/templates`
- ✅ Campaigns: `POST /v2/basic-campaigns`
- ✅ Restart: `POST /v2/basic-campaigns/:campaignId/restart`

**Template Payload Structure:**
```javascript
{
  "htmlCode": "...",      // Your HTML content
  "cssSection": "",       // Optional CSS
  "jsSection": "",        // Optional JavaScript
  "title": "Template Name"
}
```

**Campaign Payload Structure:**
```javascript
{
  // Basic Info
  "title": "Campaign Title",
  "description": "Campaign Description",
  "categoryId": "1001",
  
  // Financial
  "paymentPerTask": 0.07,
  
  // Positions & Timing
  "availablePositions": 30,
  "minutesToFinish": 30,
  "ttr": 7,
  
  // Speed
  "speed": 1000,
  
  // Zone (International)
  "internationalZone": {
    "id": "int",
    "excludedCountries": []
  },
  
  // Template Configuration
  "internalTemplate": {
    "id": "template-id",
    "adminInstructions": "...",
    "numberOfSubTasks": 1,
    "ratingMethodId": 3,
    "displaySubTasksOnSamePage": false,
    "allowedFileTypes": [],
    "numberOfFileProofs": 0
  },
  
  // Additional Settings
  "qtRequired": true,
  "removePositionOnNokRating": false,
  "taskOrder": 2,
  "visibilityDelay": 0,
  "chatEnabled": false,
  
  // Auto Skip
  "autoSkipTask": {
    "enabled": false,
    "timeLimit": 120
  },
  
  // Job Limits
  "maximumJobLimit": {
    "enabled": false
  },
  
  "tasks": [],
  "notificationSettings": []
}
```

### 2. Frontend Service (`mockService.ts`)
**Updated `createMicroworkersCampaign` function:**
- ✅ Template creation uses v2 API fields
- ✅ Campaign creation includes all required fields
- ✅ Proper error handling with violation details
- ✅ Full internalTemplate configuration

## How to Test

### Option 1: Direct API Test
Run the test script to verify API integration:
```bash
node test-mw-api.js YOUR_API_KEY
```

### Option 2: Through Your Application
1. **Start Backend Server:**
   ```bash
   node server.js
   ```

2. **Configure Settings:**
   - Go to Admin > Server Connection
   - Set Backend URL: `http://localhost:3001`
   - Set MW API Key: `YOUR_API_KEY`

3. **Create Campaign:**
   - Go to Mw tab
   - Fill in required fields:
     - Search Query/Keyword
     - Result Text (what workers should find)
     - Page Position (e.g., "1")
   - Click "Start ✓ Work"

## API Documentation

See `microworkers-api-guide.md` for complete API documentation including:
- All endpoint specifications
- Request/response examples
- Common errors
- Best practices

## Files Modified

1. ✅ `server.js` - Backend proxy with v2 API support
2. ✅ `services/mockService.ts` - Frontend service with correct payloads
3. ✅ `microworkers-api-guide.md` - API documentation (NEW)
4. ✅ `test-mw-api.js` - API test script (NEW)

## Template System

Your templates are stored in Microworkers and referenced by ID. The system:
1. Creates a template with your HTML/CSS/JS
2. Receives a template ID
3. Uses that ID when creating campaigns

You can reuse templates across multiple campaigns!

## Error Handling

The system now properly handles:
- ❌ Missing required fields → Shows specific violation details
- ❌ Invalid category → Shows available categories
- ❌ Template not found → Clear error message
- ❌ Network errors → Falls back to mock mode (local testing)

## Next Steps

1. **Test the Integration:**
   ```bash
   node test-mw-api.js YOUR_API_KEY
   ```

2. **Start Your Backend:**
   ```bash
   node server.js
   ```

3. **Create Your First Campaign:**
   - Use the Mw tab in your application
   - Fill in the required fields
   - Click "Start ✓ Work"

## Notes

- Sandbox URL: `https://sandbox.microworkers.com/api.php`
- Minimum payment: $0.07 per task
- Default positions: 30
- Default time to finish: 30 minutes
- Default TTR (time to review): 7 days

All API payloads are now compliant with Microworkers v2 API specification! 🎉
