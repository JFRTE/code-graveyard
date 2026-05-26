-- Bookmarks, Reports, View tracking, Tags
-- Run in Supabase SQL Editor

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  tombstone_id UUID NOT NULL REFERENCES tombstones(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tombstone_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own bookmarks" ON bookmarks FOR ALL USING (auth.uid()::text = user_id);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  tombstone_id UUID NOT NULL REFERENCES tombstones(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (auth.uid()::text = user_id);

-- Add view_count and tags to tombstones (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tombstones' AND column_name = 'view_count') THEN
    ALTER TABLE tombstones ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tombstones' AND column_name = 'tags') THEN
    ALTER TABLE tombstones ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Admin function: check if user is admin (by GitHub username)
-- Update 'JFRTE' to your GitHub username
CREATE OR REPLACE FUNCTION is_admin(user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_id = 'JFRTE';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
