-- Migration: Fix User ID Schema to match Auth User ID
-- This migration fixes the foreign key relationship between users and chat_sessions
-- by making users.id the same as the auth user ID instead of having a separate auth_user_id column

-- =====================================================
-- STEP 1: Drop existing foreign key constraints and policies
-- =====================================================

-- Drop RLS policies that reference user_id
DROP POLICY IF EXISTS "Users can view own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can insert own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can delete own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- =====================================================
-- STEP 2: Restructure users table
-- =====================================================

-- Drop the trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the old function
DROP FUNCTION IF EXISTS handle_new_user();

-- Create temporary table to store existing data
CREATE TEMP TABLE users_backup AS SELECT * FROM users;

-- Drop dependent tables' foreign keys temporarily
ALTER TABLE chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_user_id_fkey;
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;
ALTER TABLE analytics_events DROP CONSTRAINT IF EXISTS analytics_events_user_id_fkey;

-- Truncate users table (we'll recreate records with proper IDs)
TRUNCATE users CASCADE;

-- Modify users table structure
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE users DROP COLUMN IF EXISTS auth_user_id;
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE users ADD PRIMARY KEY (id);

-- Add comment
COMMENT ON COLUMN users.id IS 'Primary key - same as auth.users.id for Supabase Auth integration';

-- =====================================================
-- STEP 3: Create new trigger function
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert with auth user ID as the primary key
  INSERT INTO public.users (id, email, full_name, avatar_url, created_at, last_seen)
  VALUES (
    NEW.id,  -- Use auth user ID as primary key
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION handle_new_user IS 'Creates user record when auth user is created, using auth ID as primary key';

-- =====================================================
-- STEP 4: Create trigger
-- =====================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- STEP 5: Recreate foreign key constraints
-- =====================================================

ALTER TABLE chat_sessions 
  ADD CONSTRAINT chat_sessions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_preferences 
  ADD CONSTRAINT user_preferences_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE analytics_events 
  ADD CONSTRAINT analytics_events_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- =====================================================
-- STEP 6: Drop ALL existing policies to ensure clean slate
-- =====================================================

-- Drop all users policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;

-- Drop all chat_sessions policies  
DROP POLICY IF EXISTS "Users can view own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can insert own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can delete own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can view their own sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON chat_sessions;

-- Drop all chat_messages policies
DROP POLICY IF EXISTS "Users can view messages from own sessions" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert messages to own sessions" ON chat_messages;
DROP POLICY IF EXISTS "Users can update messages from own sessions" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete messages from own sessions" ON chat_messages;
DROP POLICY IF EXISTS "Users can view messages from their sessions" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert messages to their sessions" ON chat_messages;
DROP POLICY IF EXISTS "Users can update messages in their sessions" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete messages from their sessions" ON chat_messages;

-- Drop all user_preferences policies
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;

-- Drop all analytics_events policies
DROP POLICY IF EXISTS "Users can view own analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Users can insert own analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Users can update own analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Users can delete own analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Users can view their own events" ON analytics_events;
DROP POLICY IF EXISTS "Anyone can insert events" ON analytics_events;

-- =====================================================
-- STEP 7: Recreate RLS policies with new schema
-- =====================================================

-- Users table policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Chat sessions policies
CREATE POLICY "Users can view own chat sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions" ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions" ON chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can view messages from own sessions" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own sessions" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages from own sessions" ON chat_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages from own sessions" ON chat_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Analytics events policies
CREATE POLICY "Users can view own analytics events" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics events" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics events" ON analytics_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analytics events" ON analytics_events
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- STEP 8: Update connect_wallet_to_user function
-- =====================================================

CREATE OR REPLACE FUNCTION connect_wallet_to_user(wallet_addr TEXT)
RETURNS users AS $$
DECLARE
  user_record users;
BEGIN
  -- Check if wallet is already connected to another user
  IF EXISTS (SELECT 1 FROM users WHERE wallet_address = wallet_addr AND id != auth.uid()) THEN
    RAISE EXCEPTION 'Wallet address is already connected to another user';
  END IF;
  
  -- Update current user's wallet address
  UPDATE users 
  SET wallet_address = wallet_addr, last_seen = NOW()
  WHERE id = auth.uid()
  RETURNING * INTO user_record;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  RETURN user_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION connect_wallet_to_user IS 'Connects a wallet address to the authenticated user';

-- =====================================================
-- STEP 9: Create users for existing auth users
-- =====================================================

-- This will create user records for any existing auth users that don't have one yet
INSERT INTO public.users (id, email, full_name, avatar_url, created_at, last_seen)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name'),
  raw_user_meta_data->>'avatar_url',
  created_at,
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM users)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✓ User ID schema fixed successfully!';
  RAISE NOTICE '✓ users.id now matches auth.users.id directly';
  RAISE NOTICE '✓ Removed auth_user_id column';
  RAISE NOTICE '✓ Updated all foreign key constraints';
  RAISE NOTICE '✓ Updated all RLS policies';
  RAISE NOTICE '✓ Created user records for existing auth users';
END $$;

