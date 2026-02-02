-- ZilSeo Database Schema (Updated)

-- MIGRATION: Ensure user_id and other critical columns exist on pre-existing tables
-- This is RUN FIRST to ensure subsequent parts of the script (like policies) don't fail.
DO $$ 
BEGIN
  -- 1. Profiles
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'profiles') THEN
    CREATE TABLE profiles (
      id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT,
      role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  END IF;

  -- 2. Websites
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'websites') THEN
    CREATE TABLE websites (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      category TEXT,
      notes TEXT,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      gsc_connected BOOLEAN DEFAULT false,
      gsc_email TEXT,
      access_token TEXT,
      last_scraped TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  ELSE
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'websites' AND COLUMN_NAME = 'user_id') THEN
      ALTER TABLE websites ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
  END IF;

  -- 3. Social Links
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'social_links') THEN
    CREATE TABLE social_links (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      website_id UUID REFERENCES websites(id) ON DELETE CASCADE NOT NULL,
      platform TEXT NOT NULL CHECK (platform IN ('facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'other')),
      url TEXT NOT NULL,
      is_work_enabled BOOLEAN DEFAULT false,
      mw_campaign_id TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  END IF;

  -- 4. Pages
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'pages') THEN
    CREATE TABLE pages (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      website_id UUID REFERENCES websites(id) ON DELETE CASCADE NOT NULL,
      url TEXT NOT NULL,
      title TEXT,
      status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'published')),
      keyword TEXT,
      category TEXT,
      page_position TEXT DEFAULT '0',
      result_text TEXT,
      meta_title TEXT,
      meta_description TEXT,
      content JSONB DEFAULT '[]',
      faqs JSONB DEFAULT '[]',
      links JSONB DEFAULT '[]',
      is_work_enabled BOOLEAN DEFAULT false,
      mw_campaign_id TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  END IF;

  -- 5. Posts
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'posts') THEN
    CREATE TABLE posts (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      website_id UUID REFERENCES websites(id) ON DELETE CASCADE NOT NULL,
      url TEXT NOT NULL,
      title TEXT,
      status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'published')),
      publish_date DATE,
      keywords TEXT[] DEFAULT '{}',
      search_query TEXT,
      page_position TEXT DEFAULT '0',
      result_text TEXT,
      meta_title TEXT,
      meta_description TEXT,
      content JSONB DEFAULT '[]',
      faqs JSONB DEFAULT '[]',
      is_work_enabled BOOLEAN DEFAULT false,
      mw_campaign_id TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  END IF;

  -- 6. Work Items
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'work_items') THEN
    CREATE TABLE work_items (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      assigned_to_user_id TEXT,
      due_date DATE,
      status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'needs_revision', 'rejected', 'done')),
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
      proof_link TEXT,
      worker_id TEXT,
      mw_campaign_id TEXT,
      rejection_reason TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  ELSE
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'work_items' AND COLUMN_NAME = 'mw_campaign_id') THEN
      ALTER TABLE work_items ADD COLUMN mw_campaign_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'work_items' AND COLUMN_NAME = 'assigned_to_user_id') THEN
      ALTER TABLE work_items ADD COLUMN assigned_to_user_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'work_items' AND COLUMN_NAME = 'target_url') THEN
      ALTER TABLE work_items ADD COLUMN target_url TEXT;
    END IF;
  END IF;

  -- 7. External Links
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'external_links') THEN
    CREATE TABLE external_links (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      website_id UUID REFERENCES websites(id) ON DELETE CASCADE NOT NULL,
      title TEXT NOT NULL,
      keyword TEXT NOT NULL,
      article_title TEXT NOT NULL,
      landing_page_domain TEXT NOT NULL,
      is_work_enabled BOOLEAN DEFAULT false,
      mw_campaign_id TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  END IF;

  -- 8. Keyword Targets
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'keyword_targets') THEN
    CREATE TABLE keyword_targets (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      website_id UUID REFERENCES websites(id) ON DELETE CASCADE NOT NULL,
      keyword TEXT NOT NULL,
      target_url TEXT NOT NULL,
      tags TEXT[] DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  END IF;

  -- 9. Keyword Rankings
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'keyword_rankings') THEN
    CREATE TABLE keyword_rankings (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      target_id UUID REFERENCES keyword_targets(id) ON DELETE CASCADE NOT NULL,
      date DATE DEFAULT CURRENT_DATE NOT NULL,
      position INTEGER,
      search_query TEXT,
      page_position INTEGER,
      pages_available INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  END IF;

  -- 10. Permissions
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'permissions') THEN
    CREATE TABLE permissions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      module TEXT NOT NULL,
      can_view BOOLEAN DEFAULT false,
      can_edit BOOLEAN DEFAULT false,
      can_delete BOOLEAN DEFAULT false,
      UNIQUE(user_id, module)
    );
  ELSE
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'permissions' AND COLUMN_NAME = 'user_id') THEN
      ALTER TABLE permissions ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to allow re-run
DO $$ 
DECLARE
  pol record;
BEGIN
  FOR pol IN 
    SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON ' || pol.tablename;
  END LOOP;
END $$;

-- Policies for Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for Websites
CREATE POLICY "Users can view own websites" ON websites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own websites" ON websites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own websites" ON websites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own websites" ON websites FOR DELETE USING (auth.uid() = user_id);

-- Policies for Social Links
CREATE POLICY "Users can manage social links of their own websites" ON social_links 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = social_links.website_id 
    AND websites.user_id = auth.uid()
  )
);

-- Policies for Pages
CREATE POLICY "Users can manage pages of their own websites" ON pages 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = pages.website_id 
    AND websites.user_id = auth.uid()
  )
);

-- Policies for Posts
CREATE POLICY "Users can manage posts of their own websites" ON posts 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = posts.website_id 
    AND websites.user_id = auth.uid()
  )
);

-- Policies for Work Items
CREATE POLICY "Users can manage work items of their own websites" ON work_items 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = work_items.website_id 
    AND websites.user_id = auth.uid()
  )
);

-- Policies for External Links
CREATE POLICY "Users can manage external links of their own websites" ON external_links 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = external_links.website_id 
    AND websites.user_id = auth.uid()
  )
);

-- Policies for Keyword Targets
CREATE POLICY "Users can manage keyword targets of their own websites" ON keyword_targets 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = keyword_targets.website_id 
    AND websites.user_id = auth.uid()
  )
);

-- Policies for Keyword Rankings
CREATE POLICY "Users can manage keyword rankings of their own targets" ON keyword_rankings 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM keyword_targets 
    JOIN websites ON websites.id = keyword_targets.website_id
    WHERE keyword_targets.id = keyword_rankings.target_id 
    AND websites.user_id = auth.uid()
  )
);

-- Policies for Permissions
CREATE POLICY "Users can view own permissions" ON permissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all permissions" ON permissions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);


-- TEMPORARY: Disable RLS to allow viewing all data during development
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE websites DISABLE ROW LEVEL SECURITY;
ALTER TABLE pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE external_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_targets DISABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_rankings DISABLE ROW LEVEL SECURITY;
ALTER TABLE permissions DISABLE ROW LEVEL SECURITY;
