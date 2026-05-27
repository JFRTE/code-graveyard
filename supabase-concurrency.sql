-- Atomic increment function for Code Graveyard
-- Run in Supabase SQL Editor

-- Atomic increment function (prevents race conditions)
CREATE OR REPLACE FUNCTION increment_counter(row_id UUID, column_name TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE tombstones SET %I = COALESCE(%I, 0) + 1 WHERE id = $1', column_name, column_name)
  USING row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- UNIQUE constraints to prevent duplicate interactions
-- (IF NOT EXISTS not supported for constraints, so use DO block)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_flower') THEN
    ALTER TABLE flowers ADD CONSTRAINT unique_user_flower UNIQUE(user_id, tombstone_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_candle') THEN
    ALTER TABLE candles ADD CONSTRAINT unique_user_candle UNIQUE(user_id, tombstone_id);
  END IF;
END $$;

-- Rate limiting table (Supabase-based)
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON rate_limits FOR ALL USING (true);

-- Rate limit check function
CREATE OR REPLACE FUNCTION check_rate_limit(p_key TEXT, p_max INTEGER DEFAULT 30, p_window_seconds INTEGER DEFAULT 60)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMPTZ;
BEGIN
  -- Get current window
  SELECT count, rate_limits.window_start INTO current_count, window_start
  FROM rate_limits WHERE key = p_key;
  
  IF NOT FOUND THEN
    -- New key, insert and allow
    INSERT INTO rate_limits (key, count, window_start) VALUES (p_key, 1, NOW());
    RETURN TRUE;
  END IF;
  
  -- Check if window expired
  IF NOW() - window_start > (p_window_seconds || ' seconds')::INTERVAL THEN
    -- Reset window
    UPDATE rate_limits SET count = 1, window_start = NOW() WHERE key = p_key;
    RETURN TRUE;
  END IF;
  
  -- Check limit
  IF current_count >= p_max THEN
    RETURN FALSE;
  END IF;
  
  -- Increment
  UPDATE rate_limits SET count = count + 1 WHERE key = p_key;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
