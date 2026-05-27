-- Atomic increment function for Code Graveyard
-- Run in Supabase SQL Editor

-- Atomic increment function with column whitelist (prevents SQL injection)
CREATE OR REPLACE FUNCTION increment_counter(row_id UUID, column_name TEXT)
RETURNS void AS $$
DECLARE
  allowed_columns TEXT[] := ARRAY['flower_count', 'eulogy_count', 'candle_count', 'view_count'];
BEGIN
  -- Validate column name against whitelist
  IF NOT (column_name = ANY(allowed_columns)) THEN
    RAISE EXCEPTION 'Invalid column name: %', column_name;
  END IF;
  
  EXECUTE format('UPDATE tombstones SET %I = COALESCE(%I, 0) + 1 WHERE id = $1', column_name, column_name)
  USING row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- UNIQUE constraints to prevent duplicate interactions
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
  SELECT count, rate_limits.window_start INTO current_count, window_start
  FROM rate_limits WHERE key = p_key;
  
  IF NOT FOUND THEN
    INSERT INTO rate_limits (key, count, window_start) VALUES (p_key, 1, NOW());
    RETURN TRUE;
  END IF;
  
  IF NOW() - window_start > (p_window_seconds || ' seconds')::INTERVAL THEN
    UPDATE rate_limits SET count = 1, window_start = NOW() WHERE key = p_key;
    RETURN TRUE;
  END IF;
  
  IF current_count >= p_max THEN
    RETURN FALSE;
  END IF;
  
  UPDATE rate_limits SET count = count + 1 WHERE key = p_key;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
