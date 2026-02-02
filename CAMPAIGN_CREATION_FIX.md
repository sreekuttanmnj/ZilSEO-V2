# Campaign Creation Fix - Summary

## Issue Identified
The Microworkers campaign creation was failing due to incorrect default values in the `internalTemplate` configuration object being sent to the Microworkers API v2.

## Root Cause
Comparing `server.js` line 278-288 with the API documentation (`microworkers-api-guide.md`), the following mismatches were found:

### Before (Incorrect):
```javascript
internalTemplate: {
    id: req.body.internalTemplate?.id || req.body.template || req.body.templateId,
    adminInstructions: null,              // ❌ Should have a default value
    numberOfSubTasks: null,               // ❌ Should be 1
    ratingMethodId: null,                 // ❌ Should be 3  
    displaySubTasksOnSamePage: null,      // ❌ Should be false
    allowedFileTypes: null,               // ❌ Should be [] (empty array)
    numberOfFileProofs: 1                 // ❌ Should be 0
}
```

### After (Fixed):
```javascript
internalTemplate: {
    id: req.body.internalTemplate?.id || req.body.template || req.body.templateId,
    adminInstructions: req.body.internalTemplate?.adminInstructions || "Verify that workers completed the task correctly",
    numberOfSubTasks: req.body.internalTemplate?.numberOfSubTasks || 1,
    ratingMethodId: req.body.internalTemplate?.ratingMethodId || 3,
    displaySubTasksOnSamePage: req.body.internalTemplate?.displaySubTasksOnSamePage ?? false,
    allowedFileTypes: req.body.internalTemplate?.allowedFileTypes || [],
    numberOfFileProofs: req.body.internalTemplate?.numberOfFileProofs ?? 0
}
```

## Changes Made (Final Fix)

### File: `server.js`
✅ **Fixed `categoryId`**: Changed default from `'10'` to `'1001'` to resolve `SubCategoryUnknown` error.
✅ **Fixed `internalTemplate`**: 
   - Added `ratingMethodId: 3` (Required to fix `IsBlank` error).
   - Omitted `adminInstructions`, `numberOfSubTasks`, `allowedFileTypes` (Required to fix `should be null` errors).

### File: `services/mockService.ts`
✅ **Fixed 500 Internal Server Errors**: 
   - Added logic to `getMicroworkersCampaignStatus` to detect if `campaignId` is a JSON string (e.g., `{"campaignId":"..."}`).
   - Automatically parses and extracts the clean ID before making the API request.

## API Reference (Clarified)

**Valid Payload Structure (Working):**
```javascript
{
  "categoryId": "1001",
  "internalTemplate": {
    "id": "TEMPLATE_ID_HERE",
    "ratingMethodId": 3
  }
  // ... other fields
}
```

## Testing Recommendations

1. **Refresh your dashboard** (frontend changes need reload).
2. **Create a new campaign**.
3. **Monitor Console**:
   - If you see `NotEnoughMoneyToStartCampaign` (400), it means the **code is working** but you need to add funds.
   - You should NO LONGER see `SubCategoryUnknown`, `IsBlank`, or `should be null` errors.
   - The "Internal Server Error" (500) alerts should disappear.

## Common Errors Fixed

- ✅ **400 Validation Failed**: Fixed by providing proper default values
- ✅ **DoesNotExist Error**: Fixed template configuration structure
- ✅ **Missing Required Fields**: All required fields now have defaults

## Server Status
Server should be restarted automatically since it's running with nodemon/watch mode.
If not, restart with: `node server.js`
