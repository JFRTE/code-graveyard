-- 代码火葬场数据库 Schema
-- 在 Supabase SQL Editor 中执行

CREATE TABLE tombstones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  code_name TEXT NOT NULL,
  code_content TEXT NOT NULL,
  language TEXT DEFAULT 'unknown',
  cause_of_death TEXT NOT NULL,
  birth_date DATE,
  death_date DATE DEFAULT CURRENT_DATE,
  description TEXT DEFAULT '',
  flower_count INTEGER DEFAULT 0,
  eulogy_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE eulogies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tombstone_id UUID NOT NULL REFERENCES tombstones(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE flowers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tombstone_id UUID NOT NULL REFERENCES tombstones(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tombstone_id, user_id)
);

CREATE INDEX idx_tombstones_user_id ON tombstones(user_id);
CREATE INDEX idx_tombstones_created_at ON tombstones(created_at DESC);
CREATE INDEX idx_eulogies_tombstone_id ON eulogies(tombstone_id);
CREATE INDEX idx_flowers_tombstone_id ON flowers(tombstone_id);

CREATE OR REPLACE FUNCTION increment_eulogy_count(tombstone_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tombstones SET eulogy_count = eulogy_count + 1 WHERE id = tombstone_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_flower_count(tombstone_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tombstones SET flower_count = flower_count + 1 WHERE id = tombstone_id;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE tombstones ENABLE ROW LEVEL SECURITY;
ALTER TABLE eulogies ENABLE ROW LEVEL SECURITY;
ALTER TABLE flowers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on tombstones" ON tombstones FOR SELECT USING (true);
CREATE POLICY "Allow public read access on eulogies" ON eulogies FOR SELECT USING (true);
CREATE POLICY "Allow public read access on flowers" ON flowers FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on tombstones" ON tombstones FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated insert on eulogies" ON eulogies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated insert on flowers" ON flowers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete own tombstones" ON tombstones FOR DELETE USING (true);

-- 示例数据
INSERT INTO tombstones (user_id, username, avatar_url, code_name, code_content, language, cause_of_death, birth_date, death_date, description, flower_count, eulogy_count) VALUES
('demo-user', 'DemoUser', 'https://github.com/identicons/demo.png', 'getUserData()', 'async function getUserData(id) {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  return data;
}', 'javascript', 'refactored', '2023-03-15', '2024-08-20', '被 async/await 的优雅写法替代，安息吧老朋友', 12, 3),
('demo-user', 'DemoUser', 'https://github.com/identicons/demo.png', 'legacyAuth()', 'function legacyAuth(username, password) {
  if (username === "admin" && password === "123456") {
    return true;
  }
  return false;
}', 'javascript', 'tech_obsolete', '2020-06-01', '2024-06-01', '明文密码的时代结束了', 25, 5);
