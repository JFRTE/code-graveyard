-- Fix RLS for NextAuth compatibility
-- Run in Supabase SQL Editor

-- Disable RLS on bookmarks (auth is handled by NextAuth in API routes)
ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own bookmarks" ON bookmarks;

-- Disable RLS on reports
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create reports" ON reports;
DROP POLICY IF EXISTS "Users can view own reports" ON reports;

-- Disable RLS on notifications
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- Disable RLS on activity_log
ALTER TABLE activity_log DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view activity" ON activity_log;
DROP POLICY IF EXISTS "System can insert activity" ON activity_log;

-- Disable RLS on rate_limits
ALTER TABLE rate_limits DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role only" ON rate_limits;
