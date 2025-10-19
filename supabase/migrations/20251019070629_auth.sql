-- Migration: Supabase Auth Integration
-- This migration updates the database schema to support Supabase Auth
-- instead of wallet-only authentication

-- 1. Update users table schema
-- Make wallet_address nullable and add auth-related columns
ALTER TABLE users 
  ALTER COLUMN wallet_address DROP NOT NULL,
  ADD COLUMN email TEXT UNIQUE,
  ADD COLUMN full_name TEXT,
  ADD COLUMN avatar_url TEXT,
  ADD COLUMN auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index on auth_user_id for performance
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);

-- 2. Remove old wallet-only functions
-- First drop policies that depend on get_current_wallet_address()
DROP POLICY IF EXISTS "Users can view incidents from their own sessions" ON incidents;
DROP POLICY IF EXISTS "Users can insert incidents for their own sessions" ON incidents;
DROP POLICY IF EXISTS "Users can update incidents from their own sessions" ON incidents;

-- Now drop the functions
DROP FUNCTION IF EXISTS upsert_user(TEXT);
DROP FUNCTION IF EXISTS set_wallet_context(TEXT);
DROP FUNCTION IF EXISTS get_current_wallet_address();

-- 3. Create new function to handle user creation/update from auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, email, full_name, avatar_url, created_at, last_seen)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger to automatically create user record when auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5. Update RLS policies to use auth.uid() instead of wallet context

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Create new auth-based policies for users table
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Update chat_sessions policies
DROP POLICY IF EXISTS "Users can view own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can insert own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can delete own chat sessions" ON chat_sessions;

CREATE POLICY "Users can view own chat sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions" ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions" ON chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Update chat_messages policies
DROP POLICY IF EXISTS "Users can view messages from own sessions" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert messages to own sessions" ON chat_messages;
DROP POLICY IF EXISTS "Users can update messages from own sessions" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete messages from own sessions" ON chat_messages;

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

-- Update user_preferences policies
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;

CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Update analytics_events policies
DROP POLICY IF EXISTS "Users can view own analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Users can insert own analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Users can update own analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Users can delete own analytics events" ON analytics_events;

CREATE POLICY "Users can view own analytics events" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics events" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics events" ON analytics_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analytics events" ON analytics_events
  FOR DELETE USING (auth.uid() = user_id);

-- Update incidents policies (access via session's user_id)
-- Note: These policies were already dropped earlier, but keeping for completeness
DROP POLICY IF EXISTS "Users can view incidents from their own sessions" ON incidents;
DROP POLICY IF EXISTS "Users can insert incidents for their own sessions" ON incidents;
DROP POLICY IF EXISTS "Users can update incidents from their own sessions" ON incidents;
DROP POLICY IF EXISTS "Users can delete incidents from their own sessions" ON incidents;

CREATE POLICY "Users can view incidents from their own sessions" ON incidents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = incidents.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert incidents for their own sessions" ON incidents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = incidents.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update incidents from their own sessions" ON incidents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = incidents.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete incidents from their own sessions" ON incidents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = incidents.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- 6. Add comments for documentation
COMMENT ON COLUMN users.wallet_address IS 'Optional Algorand wallet address - can be connected after account creation';
COMMENT ON COLUMN users.email IS 'User email from Supabase Auth';
COMMENT ON COLUMN users.full_name IS 'User full name from Supabase Auth metadata';
COMMENT ON COLUMN users.avatar_url IS 'User avatar URL from Supabase Auth metadata';
COMMENT ON COLUMN users.auth_user_id IS 'Reference to auth.users.id for Supabase Auth integration';

-- 7. Create function to connect wallet to authenticated user
CREATE OR REPLACE FUNCTION connect_wallet_to_user(wallet_addr TEXT)
RETURNS users AS $$
DECLARE
  user_record users;
BEGIN
  -- Check if wallet is already connected to another user
  IF EXISTS (SELECT 1 FROM users WHERE wallet_address = wallet_addr AND auth_user_id IS NOT NULL) THEN
    RAISE EXCEPTION 'Wallet address is already connected to another user';
  END IF;
  
  -- Update current user's wallet address
  UPDATE users 
  SET wallet_address = wallet_addr, last_seen = NOW()
  WHERE auth_user_id = auth.uid()
  RETURNING * INTO user_record;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  RETURN user_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION connect_wallet_to_user IS 'Connects a wallet address to the authenticated user';
