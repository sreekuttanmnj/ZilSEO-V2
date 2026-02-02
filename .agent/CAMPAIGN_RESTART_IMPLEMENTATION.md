# Campaign Restart & Template Update Implementation

## Summary

Successfully implemented campaign restart functionality and template editing for Microworkers campaigns. Now when you restart a finished campaign, it will reuse the existing campaign ID instead of creating a duplicate. Additionally, when you edit keywords or search queries, the template will automatically update.

## Changes Made

### 1. **Type Definitions** (`types.ts`)
Added `mwTemplateId` field to store template IDs:
- `Page.mwTemplateId`
- `Post.mwTemplateId`
- `SocialLink.mwTemplateId`
- `ExternalLink.mwTemplateId`

### 2. **Service Layer** (`mockService.ts`)

#### New Methods:
- **`restartMicroworkersCampaign(campaignId)`**: Restarts an existing finished campaign using the MW API
- **`updateMicroworkersTemplate(templateId, keyword, resultText, landingDomain)`**: Updates a template's HTML content when keywords change

#### Modified Methods:
- **`createMicroworkersCampaign()`**: Now returns `{ campaignId, templateId }` instead of just `campaignId`
- **`toggleSocialWork()`**: Updated to store both campaign ID and template ID

### 3. **UI Layer** (`PagesManager.tsx`)

#### Updated Toggle Functions:
- **`togglePageWork()`**: Detects finished campaigns and restarts them instead of creating new ones
- **`togglePostWork()`**: Same restart logic for posts
- **`toggleExternalWork()`**: Same restart logic for external links

#### Updated Edit Functions:
- **`handlePageUpdate()`**: Automatically updates MW template when `keyword` or `resultText` changes
- **`handlePostUpdate()`**: Automatically updates MW template when `searchQuery` or `resultText` changes

#### UI Improvements:
- Removed disabled state for finished campaigns
- Changed tooltip from "Campaign Finished" to "Click to Restart Campaign"
- Users can now click the toggle to restart finished campaigns

### 4. **Backend API** (`server.js`)

#### New/Updated Endpoints:
- **`PUT /api/mw/campaigns/:id/restart`**: Changed from POST to PUT to restart campaigns
- **`PUT /api/mw/templates/:id`**: New endpoint to update template content

## How It Works

### Campaign Restart Flow:
1. User toggles a finished campaign ON
2. System checks if campaign exists and status is FINISHED/ENDED
3. If yes, calls `restartMicroworkersCampaign()` to restart existing campaign
4. If no campaign exists, creates a new one as before
5. Stores both `mwCampaignId` and `mwTemplateId` for future reference

### Template Update Flow:
1. User edits keyword or resultText for an active campaign
2. System detects the edit is for a monitored field
3. Retrieves the `mwTemplateId` from the page/post data
4. Generates new HTML using the updated keyword/resultText
5. Calls `updateMicroworkersTemplate()` to update the MW template
6. Template is updated live without needing to restart campaign

## Benefits

✅ **No Duplicate Campaigns**: Restarting reuses the same campaign ID
✅ **Live Template Updates**: Edit keywords without restarting campaigns
✅ **Seamless UX**: Click the same toggle to restart - no special buttons needed
✅ **Automatic Sync**: Templates stay in sync with your page data
✅ **Template ID Tracking**: All campaigns now store their template ID for future updates

## Testing Checklist

- [ ] Create a new campaign for a page
- [ ] Wait for it to finish
- [ ] Click toggle to restart - should use same campaign ID
- [ ] Edit keyword while campaign is running - template should update
- [ ] Edit resultText while campaign is running - template should update
- [ ] Verify no duplicate campaigns are created
- [ ] Check that templateId is stored in database

## API Endpoints Used

### Microworkers API v2:
- `POST /api/v2/basic-campaigns/:id/restart` - Restart finished campaign
- `PUT /api/v2/templates/:id` - Update template content

## Notes

- Restart requires a finished campaign (status FINISHED or ENDED)
- Template updates only work for active campaigns that have a templateId
- The system gracefully handles template update failures (logs error but doesn't break page update)
- Campaign positions from original campaign are reused on restart
