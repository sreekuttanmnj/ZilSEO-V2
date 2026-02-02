-- Migration: Add Google Search Console Columns and Missing Tables
-- Purpose: Ensures the 'websites' table has GSC integration columns and creates tracking tables if they don't exist.

-- 1. Update 'websites' table with GSC columns
DO $$ 
BEGIN 
    -- gsc_connected
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='websites' AND COLUMN_NAME='gsc_connected') THEN
        ALTER TABLE websites ADD COLUMN gsc_connected BOOLEAN DEFAULT FALSE;
    END IF;

    -- gsc_email
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='websites' AND COLUMN_NAME='gsc_email') THEN
        ALTER TABLE websites ADD COLUMN gsc_email TEXT;
    END IF;

    -- access_token
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='websites' AND COLUMN_NAME='access_token') THEN
        ALTER TABLE websites ADD COLUMN access_token TEXT;
    END IF;

    -- refresh_token
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='websites' AND COLUMN_NAME='refresh_token') THEN
        ALTER TABLE websites ADD COLUMN refresh_token TEXT;
    END IF;

    -- last_scraped
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='websites' AND COLUMN_NAME='last_scraped') THEN
        ALTER TABLE websites ADD COLUMN last_scraped TIMESTAMPTZ;
    END IF;
END $$;

-- 2. Create 'keyword_targets' table if missing
CREATE TABLE IF NOT EXISTS keyword_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    target_url TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create 'keyword_rankings' table if missing
CREATE TABLE IF NOT EXISTS keyword_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_id UUID REFERENCES keyword_targets(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    position NUMERIC NOT NULL,
    search_query TEXT,
    page_position INTEGER,
    pages_available INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS (Row Level Security) - Optional but recommended
ALTER TABLE keyword_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_rankings ENABLE ROW LEVEL SECURITY;

-- 5. Create basic policies (Allow all for now to match current app behavior)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'keyword_targets' AND policyname = 'Allow all') THEN
        CREATE POLICY "Allow all" ON keyword_targets FOR ALL USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'keyword_rankings' AND policyname = 'Allow all') THEN
        CREATE POLICY "Allow all" ON keyword_rankings FOR ALL USING (true);
    END IF;
END $$;
