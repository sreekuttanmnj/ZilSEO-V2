-- Add mw_template_id column to pages, posts, external_links, and social_links tables
-- This stores the Microworkers template ID for each campaign

-- Add to pages table
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS mw_template_id TEXT;

-- Add to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS mw_template_id TEXT;

-- Add to external_links table
ALTER TABLE external_links 
ADD COLUMN IF NOT EXISTS mw_template_id TEXT;

-- Add to social_links table
ALTER TABLE social_links 
ADD COLUMN IF NOT EXISTS mw_template_id TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pages_mw_template_id ON pages(mw_template_id);
CREATE INDEX IF NOT EXISTS idx_posts_mw_template_id ON posts(mw_template_id);
CREATE INDEX IF NOT EXISTS idx_external_links_mw_template_id ON external_links(mw_template_id);
CREATE INDEX IF NOT EXISTS idx_social_links_mw_template_id ON social_links(mw_template_id);

-- Add comments for documentation
COMMENT ON COLUMN pages.mw_template_id IS 'Microworkers template ID for this page campaign';
COMMENT ON COLUMN posts.mw_template_id IS 'Microworkers template ID for this post campaign';
COMMENT ON COLUMN external_links.mw_template_id IS 'Microworkers template ID for this external link campaign';
COMMENT ON COLUMN social_links.mw_template_id IS 'Microworkers template ID for this social link campaign';
