-- =====================================================
-- Sentinel dApp Database Schema
-- =====================================================
-- This migration creates the complete database schema for
-- a web3 dApp using wallet-based authentication.
-- 
-- Features:
-- - Wallet-based authentication (no traditional auth)
-- - Row Level Security (RLS) for data isolation
-- - Chat sessions and messages
-- - User preferences
-- - Analytics tracking
-- =====================================================

-- =====================================================
-- TABLES
-- =====================================================

-- -----------------------------------------------------
-- Table: users
-- Stores user records tied to wallet addresses
-- -----------------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for users table
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_last_seen ON users(last_seen);

-- Add comment
COMMENT ON TABLE users IS 'Stores user records tied to Algorand wallet addresses';
COMMENT ON COLUMN users.wallet_address IS 'Algorand wallet address (unique identifier)';
COMMENT ON COLUMN users.metadata IS 'Flexible JSONB field for additional user data';

-- -----------------------------------------------------
-- Table: chat_sessions
-- Stores chat session metadata
-- -----------------------------------------------------
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for chat_sessions table
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_wallet_address ON chat_sessions(wallet_address);
CREATE INDEX idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);

-- Add comments
COMMENT ON TABLE chat_sessions IS 'Stores chat session metadata';
COMMENT ON COLUMN chat_sessions.wallet_address IS 'Denormalized wallet address for quick queries';
COMMENT ON COLUMN chat_sessions.title IS 'Session title (auto-generated from first message)';
COMMENT ON COLUMN chat_sessions.message_count IS 'Total messages in session (auto-updated by trigger)';

-- -----------------------------------------------------
-- Table: chat_messages
-- Stores individual chat messages within sessions
-- -----------------------------------------------------
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for chat_messages table
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_role ON chat_messages(role);

-- Add comments
COMMENT ON TABLE chat_messages IS 'Stores individual chat messages within sessions';
COMMENT ON COLUMN chat_messages.role IS 'Message role: user, assistant, or system';
COMMENT ON COLUMN chat_messages.metadata IS 'Additional message data (tokens, model info, etc.)';

-- -----------------------------------------------------
-- Table: user_preferences
-- Stores user preferences and settings
-- -----------------------------------------------------
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  preferences JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user_preferences table
CREATE INDEX idx_user_preferences_wallet_address ON user_preferences(wallet_address);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Add comments
COMMENT ON TABLE user_preferences IS 'Stores user preferences and settings (one record per user)';
COMMENT ON COLUMN user_preferences.preferences IS 'JSON object containing all user preferences';

-- -----------------------------------------------------
-- Table: analytics_events
-- Stores analytics and monitoring events
-- -----------------------------------------------------
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  wallet_address TEXT,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics_events table
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_wallet_address ON analytics_events(wallet_address);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);

-- Add comments
COMMENT ON TABLE analytics_events IS 'Stores analytics and monitoring events';
COMMENT ON COLUMN analytics_events.user_id IS 'Nullable - allows anonymous event tracking';
COMMENT ON COLUMN analytics_events.event_type IS 'Event type: page_view, wallet_connect, transaction_initiated, etc.';
COMMENT ON COLUMN analytics_events.session_id IS 'Browser session identifier';

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- -----------------------------------------------------
-- Function: update_updated_at_column
-- Auto-updates the updated_at timestamp on row update
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Automatically updates updated_at timestamp on row update';

-- -----------------------------------------------------
-- Function: update_session_message_count
-- Auto-updates message count in chat_sessions
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION update_session_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE chat_sessions
    SET message_count = message_count + 1,
        updated_at = NOW()
    WHERE id = NEW.session_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE chat_sessions
    SET message_count = GREATEST(0, message_count - 1),
        updated_at = NOW()
    WHERE id = OLD.session_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_session_message_count IS 'Automatically updates message count in chat_sessions when messages are added/removed';

-- -----------------------------------------------------
-- Function: set_wallet_context
-- Sets the current wallet address in session for RLS
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION set_wallet_context(wallet_addr TEXT)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_wallet_address', wallet_addr, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION set_wallet_context IS 'Sets the current wallet address in session context for RLS policies';

-- -----------------------------------------------------
-- Function: get_current_wallet_address
-- Helper to get current wallet address from context
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION get_current_wallet_address()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.current_wallet_address', true);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_current_wallet_address IS 'Gets the current wallet address from session context';

-- -----------------------------------------------------
-- Function: upsert_user
-- Creates or updates a user record and returns user data
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION upsert_user(wallet_addr TEXT)
RETURNS TABLE (
  id UUID,
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  last_seen TIMESTAMP WITH TIME ZONE,
  metadata JSONB
) AS $$
BEGIN
  -- Update last_seen if user exists, otherwise create new user
  INSERT INTO users (wallet_address, last_seen)
  VALUES (wallet_addr, NOW())
  ON CONFLICT (wallet_address)
  DO UPDATE SET last_seen = NOW();
  
  -- Return the user record
  RETURN QUERY
  SELECT u.id, u.wallet_address, u.created_at, u.last_seen, u.metadata
  FROM users u
  WHERE u.wallet_address = wallet_addr;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION upsert_user IS 'Creates or updates a user record and returns user data';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Auto-update updated_at for chat_sessions
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update updated_at for user_preferences
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update message_count on insert
CREATE TRIGGER update_message_count_on_insert
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_session_message_count();

-- Trigger: Auto-update message_count on delete
CREATE TRIGGER update_message_count_on_delete
  AFTER DELETE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_session_message_count();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- -----------------------------------------------------
-- RLS for users table
-- -----------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT
  USING (
    wallet_address = COALESCE(
      current_setting('app.current_wallet_address', true),
      ''
    )
  );

-- Users can insert their own record
CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT
  WITH CHECK (
    wallet_address = COALESCE(
      current_setting('app.current_wallet_address', true),
      ''
    )
  );

-- Users can update their own record
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE
  USING (
    wallet_address = COALESCE(
      current_setting('app.current_wallet_address', true),
      ''
    )
  );

-- -----------------------------------------------------
-- RLS for chat_sessions table
-- -----------------------------------------------------
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions" ON chat_sessions
  FOR SELECT
  USING (
    wallet_address = COALESCE(
      current_setting('app.current_wallet_address', true),
      ''
    )
  );

-- Users can insert their own sessions
CREATE POLICY "Users can insert their own sessions" ON chat_sessions
  FOR INSERT
  WITH CHECK (
    wallet_address = COALESCE(
      current_setting('app.current_wallet_address', true),
      ''
    )
  );

-- Users can update their own sessions
CREATE POLICY "Users can update their own sessions" ON chat_sessions
  FOR UPDATE
  USING (
    wallet_address = COALESCE(
      current_setting('app.current_wallet_address', true),
      ''
    )
  );

-- Users can delete their own sessions
CREATE POLICY "Users can delete their own sessions" ON chat_sessions
  FOR DELETE
  USING (
    wallet_address = COALESCE(
      current_setting('app.current_wallet_address', true),
      ''
    )
  );

-- -----------------------------------------------------
-- RLS for chat_messages table
-- -----------------------------------------------------
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages from their sessions
CREATE POLICY "Users can view messages from their sessions" ON chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.wallet_address = COALESCE(
        current_setting('app.current_wallet_address', true),
        ''
      )
    )
  );

-- Users can insert messages to their sessions
CREATE POLICY "Users can insert messages to their sessions" ON chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.wallet_address = COALESCE(
        current_setting('app.current_wallet_address', true),
        ''
      )
    )
  );

-- Users can update messages in their sessions
CREATE POLICY "Users can update messages in their sessions" ON chat_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.wallet_address = COALESCE(
        current_setting('app.current_wallet_address', true),
        ''
      )
    )
  );

-- Users can delete messages from their sessions
CREATE POLICY "Users can delete messages from their sessions" ON chat_messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.wallet_address = COALESCE(
        current_setting('app.current_wallet_address', true),
        ''
      )
    )
  );

-- -----------------------------------------------------
-- RLS for user_preferences table
-- -----------------------------------------------------
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT
  USING (
    wallet_address = COALESCE(
      current_setting('app.current_wallet_address', true),
      ''
    )
  );

-- Users can insert their own preferences
CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT
  WITH CHECK (
    wallet_address = COALESCE(
      current_setting('app.current_wallet_address', true),
      ''
    )
  );

-- Users can update their own preferences
CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE
  USING (
    wallet_address = COALESCE(
      current_setting('app.current_wallet_address', true),
      ''
    )
  );

-- -----------------------------------------------------
-- RLS for analytics_events table
-- -----------------------------------------------------
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own events (and anonymous events)
CREATE POLICY "Users can view their own events" ON analytics_events
  FOR SELECT
  USING (
    wallet_address = COALESCE(
      current_setting('app.current_wallet_address', true),
      ''
    )
    OR wallet_address IS NULL
  );

-- Anyone can insert events (for anonymous tracking)
CREATE POLICY "Anyone can insert events" ON analytics_events
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- INITIAL DATA / SETUP
-- =====================================================

-- Create a function to clean up old analytics events
-- This can be called periodically to maintain performance
CREATE OR REPLACE FUNCTION cleanup_old_analytics(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM analytics_events
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_analytics IS 'Deletes analytics events older than specified days (default 90)';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on all tables to authenticated and anon roles
-- Note: Adjust these based on your Supabase service role setup
-- The RLS policies will still enforce access control

-- For authenticated users (if you add Supabase auth later)
-- GRANT USAGE ON SCHEMA public TO authenticated;
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- For anonymous users (limited to analytics only)
-- GRANT USAGE ON SCHEMA public TO anon;
-- GRANT INSERT ON analytics_events TO anon;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Composite index for common query patterns
CREATE INDEX idx_chat_sessions_user_updated ON chat_sessions(user_id, updated_at DESC);
CREATE INDEX idx_chat_messages_session_created ON chat_messages(session_id, created_at);
CREATE INDEX idx_analytics_wallet_type_created ON analytics_events(wallet_address, event_type, created_at DESC);

-- GIN index for JSONB searches (if you plan to query JSON fields)
CREATE INDEX idx_users_metadata_gin ON users USING GIN (metadata);
CREATE INDEX idx_chat_sessions_metadata_gin ON chat_sessions USING GIN (metadata);
CREATE INDEX idx_chat_messages_metadata_gin ON chat_messages USING GIN (metadata);
CREATE INDEX idx_user_preferences_preferences_gin ON user_preferences USING GIN (preferences);
CREATE INDEX idx_analytics_events_data_gin ON analytics_events USING GIN (event_data);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Database schema initialized successfully!';
  RAISE NOTICE '✓ Created 5 tables: users, chat_sessions, chat_messages, user_preferences, analytics_events';
  RAISE NOTICE '✓ Created 4 functions: update_updated_at_column, update_session_message_count, set_wallet_context, upsert_user';
  RAISE NOTICE '✓ Created 4 triggers for automatic updates';
  RAISE NOTICE '✓ Enabled Row Level Security on all tables';
  RAISE NOTICE '✓ Created helper function for analytics cleanup';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Test the schema with sample data';
  RAISE NOTICE '2. Configure your Supabase client in the application';
  RAISE NOTICE '3. Use set_wallet_context() function before queries to set user context';
  RAISE NOTICE '4. Use upsert_user() function when users connect their wallet';
END $$;

