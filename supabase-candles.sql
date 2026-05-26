-- 添加蜡烛表和更新墓碑表

-- 创建蜡烛表
CREATE TABLE IF NOT EXISTS candles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tombstone_id UUID NOT NULL REFERENCES tombstones(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tombstone_id, user_id)
);

-- 添加蜡烛计数字段到墓碑表
ALTER TABLE tombstones ADD COLUMN IF NOT EXISTS candle_count INTEGER DEFAULT 0;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_candles_tombstone_id ON candles(tombstone_id);
CREATE INDEX IF NOT EXISTS idx_candles_user_id ON candles(user_id);

-- 创建递增蜡烛计数的函数
CREATE OR REPLACE FUNCTION increment_candle_count(tombstone_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tombstones SET candle_count = candle_count + 1 WHERE id = tombstone_id_param;
END;
$$ LANGUAGE plpgsql;

-- 启用 RLS
ALTER TABLE candles ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Allow public read access on candles" ON candles FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on candles" ON candles FOR INSERT WITH CHECK (true);
