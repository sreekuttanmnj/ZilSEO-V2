# Campaign Management Guide

## 📋 How Toggle Buttons Work

The toggle buttons now accurately reflect the actual campaign state and provide clear actions:

### Toggle Button States

| Button State | Campaign Status | What Happens When Clicked | Tooltip Message |
|-------------|----------------|---------------------------|-----------------|
| 🔴 **OFF** (Gray) | No campaign exists | Creates NEW campaign with new template | "Click to Start New Campaign" |
| 🔴 **OFF** (Gray) | Campaign FINISHED/ENDED | Restarts SAME campaign (reuses template) | "Click to Restart Campaign (reuses template)" |
| 🔴 **OFF** (Gray) | Campaign exists but paused | Resumes the campaign | "Click to Resume Campaign" |
| 🟢 **ON** (Green) | Campaign RUNNING/NOK | Pauses the campaign (stops on MW) | "Click to Pause Campaign" |
| 🟢 **ON** (Green) | Campaign FINISHED but enabled | Disables and allows restart | "Click to Restart Campaign" |

### Campaign Status Badge

Below each toggle button, you'll see a status badge showing the real-time Microworkers status:
- **RUNNING** / **NOK** = Green - Campaign is actively accepting workers
- **FINISHED** / **ENDED** = Blue - Campaign completed all positions
- **PAUSED** = Yellow - Campaign paused by you
- **NOT FOUND** = Red - Campaign doesn't exist on MW
- **ERROR** = Red - API error checking status

---

## ✏️ Template Editing (Auto-Update)

**YES! Templates update automatically when you edit keywords or search queries.**

### How It Works:

1. **Edit While Campaign is Running:**
   - Change the "Search Query" field for a page/post
   - Change the "Result Text" field
   - Press Enter or click away (on blur)

2. **What Happens:**
   ```
   ✅ Page/Post data saves to database
   ✅ System detects keyword/resultText change
   ✅ Regenerates HTML template with new keywords
   ✅ Calls MW API to update the template
   ✅ Template updates in real-time (no restart needed!)
   ```

3. **Requirements:**
   - Campaign must have `isWorkEnabled: true`
   - Must have a `mwTemplateId` stored
   - Only works for Pages and Posts (not social links)

### Example:
```
Original Keyword: "best pizza nyc"
Worker Task: Search for "best pizza nyc"

You edit to: "best pasta nyc"

✨ Template auto-updates!
New Worker Task: Search for "best pasta nyc"
```

**No campaign restart needed! Workers see the new template immediately.**

---

## 🔄 Campaign Restart (No Duplicate Templates)

**YES! Restarting reuses the SAME template - no new template is created.**

### How Restart Works:

1. **Campaign Finishes:**
   - Status changes to FINISHED or ENDED
   - Toggle automatically turns OFF
   - Status badge shows FINISHED

2. **Click Toggle to Restart:**
   - System detects campaign exists and is finished
   - Calls `PUT /api/mw/campaigns/:id/restart` endpoint
   - MW API restarts the SAME campaign with existing:
     - ✅ Campaign ID (no duplicate!)
     - ✅ Template ID (reuses same template!)
     - ✅ All settings preserved
   - Toggle turns ON
   - Status changes to RUNNING

3. **Success Message:**
   ```
   "Campaign restarted - same template reused"
   ```

### Restart vs New Campaign

| Action | Campaign ID | Template ID | When to Use |
|--------|------------|-------------|-------------|
| **Restart** | ♻️ Reuses same | ♻️ Reuses same | Campaign finished, want more workers |
| **New Campaign** | 🆕 Creates new | 🆕 Creates new | Never had campaign, or want fresh start |

---

## 🎯 Complete Workflow Examples

### Example 1: Starting a Page Campaign
```
1. Page has no campaign (mwCampaignId: null)
2. Set positions to 50
3. Click toggle OFF→ON
4. ✅ Creates NEW campaign + NEW template
5. Stores: mwCampaignId, mwTemplateId
6. Toggle shows GREEN (ON)
7. Status badge: RUNNING
```

### Example 2: Editing Keywords While Running
```
1. Campaign is RUNNING
2. Edit "Search Query" from "pizza nyc" to "pasta nyc"
3. Press Enter or click away
4. ✅ Database updates
5. ✅ Template auto-updates on MW
6. ✅ Campaign keeps running (no downtime!)
7. Console logs: "Template xyz updated with new keyword"
```

### Example 3: Restarting a Finished Campaign
```
1. Campaign reaches FINISHED status
2. Toggle automatically turns OFF
3. Status badge shows: FINISHED
4. Click toggle OFF→ON
5. ✅ Restarts SAME campaign (same ID)
6. ✅ Reuses SAME template (same template ID)
7. Success: "Campaign restarted - same template reused"
8. Toggle shows GREEN (ON)
9. Status badge: RUNNING
```

### Example 4: Pausing a Running Campaign
```
1. Campaign is RUNNING (toggle ON, status RUNNING)
2. Tooltip shows: "Click to Pause Campaign"
3. Click toggle ON→OFF
4. ✅ Calls MW stop API
5. ✅ Campaign paused on MW
6. ✅ isWorkEnabled set to false
7. Success: "Campaign paused"
8. Toggle shows GRAY (OFF)
```

---

## 🔍 Debugging & Verification

### Check Console Logs:

**Template Update:**
```javascript
Template xyz123 updated with new keyword
// or
Template xyz123 updated with new searchQuery
```

**Campaign Restart:**
```javascript
Restarting existing campaign 12345...
Campaign 12345 restarted successfully
```

**Campaign Stop:**
```javascript
[MW] PUT https://ttv.microworkers.com/api/v2/basic-campaigns/12345/stop
```

### Check Network Tab:

**Template Update:**
```
PUT /api/mw/templates/xyz123
Body: { htmlCode: "...", cssSection: "", jsSection: "" }
```

**Campaign Restart:**
```
PUT /api/mw/campaigns/12345/restart
Body: { positionsToAdd: 10 }
```

---

## ❓ FAQ

**Q: Will editing keywords create a new campaign?**
A: No! It only updates the template. Campaign ID stays the same.

**Q: Do I need to restart the campaign after editing?**
A: No! Template updates happen in real-time while campaign runs.

**Q: What if I restart multiple times?**
A: Always uses the same campaign ID. No duplicates ever created.

**Q: Can I edit templates for social media campaigns?**
A: Not currently. Template editing only works for Pages and Posts.

**Q: What happens to workers already doing the task?**
A: They continue with the old template. New workers get the updated template.

**Q: Can I change the number of positions on restart?**
A: Currently uses the original position count. This can be customized in the restart API call.

**Q: Does pausing stop work in progress?**
A: Workers who already started continue. New workers cannot start.

---

## 🛠️ Technical Implementation

### Data Flow:

```
User edits keyword
    ↓
handlePageUpdate() called
    ↓
Checks: isWorkEnabled && mwTemplateId?
    ↓
YES → updateMicroworkersTemplate()
    ↓
Generates new HTML with updated keyword
    ↓
PUT /api/mw/templates/:id
    ↓
MW API updates template
    ↓
Console logs success
    ↓
Done! (background operation)
```

### Database Fields:

Every Page/Post now has:
```typescript
{
  mwCampaignId?: string;     // e.g., "12345"
  mwTemplateId?: string;     // e.g., "xyz789"
  isWorkEnabled?: boolean;   // true = ON, false = OFF
  keyword?: string;          // For pages
  searchQuery?: string;      // For posts
  resultText?: string;       // What workers should find
}
```

---

## ✅ Summary

**Toggle States:** Accurately reflect real campaign status
**Template Editing:** ✅ Auto-updates when you edit keywords
**Campaign Restart:** ✅ Reuses same template (no duplicates)
**Pause/Resume:** ✅ Full control over running campaigns
**Real-time Status:** ✅ Badge shows live MW API status

Everything works together seamlessly! 🎉
