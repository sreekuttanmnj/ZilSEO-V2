# Database Migration Required

## ⚠️ Error Fixed

The error you're seeing:
```
Could not find the 'mwTemplateId' column of 'pages' in the schema cache
```

This happens because the Supabase database doesn't have the `mw_template_id` column yet.

## 🔧 How to Fix

You need to run the SQL migration to add the column to your Supabase database.

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New Query"**
4. Copy and paste the SQL from `.agent/migrations/add_mw_template_id.sql`
5. Click **"Run"**
6. ✅ Column will be added to all tables

### Option 2: Supabase CLI

```bash
# Navigate to your project
cd c:\Users\Sreekuttan\Downloads\zilseo

# Run the migration
supabase db push

# Or manually execute the SQL file
supabase db execute -f .agent/migrations/add_mw_template_id.sql
```

### What the Migration Does

```sql
-- Adds mw_template_id column to:
- pages
- posts
- external_links
- social_links

-- Creates indexes for better performance
-- Adds documentation comments
```

## 📝 SQL Migration Content

```sql
-- Add mw_template_id column to pages, posts, external_links, and social_links tables

ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS mw_template_id TEXT;

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS mw_template_id TEXT;

ALTER TABLE external_links 
ADD COLUMN IF NOT EXISTS mw_template_id TEXT;

ALTER TABLE social_links 
ADD COLUMN IF NOT EXISTS mw_template_id TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pages_mw_template_id ON pages(mw_template_id);
CREATE INDEX IF NOT EXISTS idx_posts_mw_template_id ON posts(mw_template_id);
CREATE INDEX IF NOT EXISTS idx_external_links_mw_template_id ON external_links(mw_template_id);
CREATE INDEX IF NOT EXISTS idx_social_links_mw_template_id ON social_links(mw_template_id);
```

## ✅ After Running Migration

1. The error will disappear
2. Campaign creation will work properly
3. Toggle buttons will stay enabled after campaign creation
4. Template IDs will be stored for future updates

## 🧪 Test After Migration

1. Refresh your app
2. Try creating a campaign
3. Toggle should remain **ON** (green)
4. No error messages
5. Check database - you should see `mw_template_id` populated

## 💡 Why Is This Needed?

When campaigns are created, the system now stores both:
- `mw_campaign_id` - The campaign ID
- `mw_template_id` - The template ID ← **NEW**

This allows:
- ✅ Editing templates when keywords change
- ✅ Restarting campaigns without creating new templates
- ✅ Better campaign management

---

## Alternative: Temporarily Disable Template Storage

If you can't run the migration right now, you can temporarily modify the code to skip storing `mwTemplateId`:

**In `PagesManager.tsx` (lines ~295, ~356, ~462):**

Change:
```typescript
await MockService.updatePageDetails(id, { 
  isWorkEnabled: true, 
  mwCampaignId: campaignId, 
  mwTemplateId: templateId  // ← Remove this line
});
```

To:
```typescript
await MockService.updatePageDetails(id, { 
  isWorkEnabled: true, 
  mwCampaignId: campaignId
  // mwTemplateId: templateId  // ← Commented out
});
```

**Note:** This will make campaigns work, but template editing won't work until you add the column and uncomment the code.

---

**Recommended:** Run the migration - it only takes 30 seconds! 🚀
