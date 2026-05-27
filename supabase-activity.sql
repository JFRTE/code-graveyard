-- Activity log for real-time activity timeline
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('tombstone', 'flower', 'eulogy', 'candle')),
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  tombstone_id UUID REFERENCES tombstones(id) ON DELETE CASCADE,
  tombstone_name TEXT DEFAULT '',
  detail TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON activity_log(type);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view activity" ON activity_log FOR SELECT USING (true);
CREATE POLICY "System can insert activity" ON activity_log FOR INSERT WITH CHECK (true);
