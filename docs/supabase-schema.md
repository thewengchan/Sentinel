# Supabase Database Schema

> **Note:** This schema is documented for future implementation. The current application uses localStorage for persistence.

## Overview

This document defines the complete database schema for persisting user data, chat sessions, preferences, and analytics in Supabase. The schema is designed for a web3 dApp where wallet addresses serve as the primary user identifier.

## Authentication Strategy

- **No traditional auth**: Users authenticate via their web3 wallet signature
- **Wallet address as identifier**: Primary user identification through wallet address
- **Row Level Security (RLS)**: Ensures users can only access their own data

## Tables

### 1. Users Table

Stores user records tied to wallet addresses.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Indexes
  CONSTRAINT users_wallet_address_key UNIQUE (wallet_address)
);

CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_last_seen ON users(last_seen);
```

**Columns:**

- `id`: Unique identifier (UUID)
- `wallet_address`: Algorand wallet address (unique, indexed)
- `created_at`: Account creation timestamp
- `last_seen`: Last activity timestamp
- `metadata`: Flexible JSON field for additional user data

**RLS Policies:**

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT
  USING (wallet_address = current_setting('app.current_wallet_address', true));

-- Users can insert their own record
CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT
  WITH CHECK (wallet_address = current_setting('app.current_wallet_address', true));

-- Users can update their own record
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE
  USING (wallet_address = current_setting('app.current_wallet_address', true));
```

### 2. Chat Sessions Table

Stores chat session metadata.

```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Indexes
  CONSTRAINT fk_chat_sessions_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_wallet_address ON chat_sessions(wallet_address);
CREATE INDEX idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
```

**Columns:**

- `id`: Unique session identifier
- `user_id`: Foreign key to users table
- `wallet_address`: Denormalized for quick queries
- `title`: Session title (auto-generated from first message)
- `created_at`: Session creation timestamp
- `updated_at`: Last message timestamp
- `message_count`: Total messages in session
- `metadata`: Additional session data (AI model, settings, etc.)

**RLS Policies:**

```sql
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" ON chat_sessions
  FOR SELECT
  USING (wallet_address = current_setting('app.current_wallet_address', true));

CREATE POLICY "Users can insert their own sessions" ON chat_sessions
  FOR INSERT
  WITH CHECK (wallet_address = current_setting('app.current_wallet_address', true));

CREATE POLICY "Users can update their own sessions" ON chat_sessions
  FOR UPDATE
  USING (wallet_address = current_setting('app.current_wallet_address', true));

CREATE POLICY "Users can delete their own sessions" ON chat_sessions
  FOR DELETE
  USING (wallet_address = current_setting('app.current_wallet_address', true));
```

### 3. Chat Messages Table

Stores individual chat messages within sessions.

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Indexes
  CONSTRAINT fk_chat_messages_session FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_role ON chat_messages(role);
```

**Columns:**

- `id`: Unique message identifier
- `session_id`: Foreign key to chat_sessions
- `role`: Message role (user, assistant, system)
- `content`: Message text content
- `created_at`: Message timestamp
- `metadata`: Additional message data (tokens, model info, etc.)

**RLS Policies:**

```sql
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from their sessions" ON chat_messages
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM chat_sessions
      WHERE wallet_address = current_setting('app.current_wallet_address', true)
    )
  );

CREATE POLICY "Users can insert messages to their sessions" ON chat_messages
  FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM chat_sessions
      WHERE wallet_address = current_setting('app.current_wallet_address', true)
    )
  );

CREATE POLICY "Users can delete messages from their sessions" ON chat_messages
  FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM chat_sessions
      WHERE wallet_address = current_setting('app.current_wallet_address', true)
    )
  );
```

### 4. User Preferences Table

Stores user preferences and settings.

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  wallet_address TEXT NOT NULL,
  preferences JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes
  CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT user_preferences_user_id_key UNIQUE (user_id)
);

CREATE INDEX idx_user_preferences_wallet_address ON user_preferences(wallet_address);
```

**Columns:**

- `id`: Unique identifier
- `user_id`: Foreign key to users table (unique - one preferences record per user)
- `wallet_address`: Denormalized for quick queries
- `preferences`: JSON object containing all preferences
- `updated_at`: Last update timestamp

**Preferences JSON Structure:**

```json
{
	"savedAddresses": [
		{
			"address": "ALGORAND_ADDRESS",
			"label": "My savings wallet",
			"createdAt": "2024-01-01T00:00:00Z"
		}
	],
	"notifications": {
		"enabled": true,
		"transactionAlerts": true,
		"chatNotifications": false
	},
	"display": {
		"compactMode": false,
		"showBalanceInUSD": true
	}
}
```

**RLS Policies:**

```sql
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT
  USING (wallet_address = current_setting('app.current_wallet_address', true));

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT
  WITH CHECK (wallet_address = current_setting('app.current_wallet_address', true));

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE
  USING (wallet_address = current_setting('app.current_wallet_address', true));
```

### 5. Analytics Events Table

Stores analytics and monitoring events.

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  wallet_address TEXT,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes
  CONSTRAINT fk_analytics_events_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_wallet_address ON analytics_events(wallet_address);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
```

**Columns:**

- `id`: Unique event identifier
- `user_id`: Foreign key to users table (nullable - for anonymous events)
- `wallet_address`: Wallet address (nullable - for anonymous events)
- `event_type`: Event type string (indexed)
- `event_data`: Event-specific data
- `session_id`: Browser session identifier
- `created_at`: Event timestamp

**Event Types:**

- `page_view`: Page navigation
- `wallet_connect`: Wallet connection
- `wallet_disconnect`: Wallet disconnection
- `transaction_initiated`: Transaction started
- `transaction_completed`: Transaction confirmed
- `transaction_failed`: Transaction error
- `feature_used`: Specific feature interaction
- `error_occurred`: Application error

**Event Data Examples:**

```json
// page_view
{
  "path": "/wallet",
  "referrer": "/",
  "userAgent": "..."
}

// wallet_connect
{
  "walletType": "Pera",
  "network": "testnet"
}

// transaction_initiated
{
  "type": "payment",
  "amount": 1.5,
  "asset": "ALGO"
}

// feature_used
{
  "feature": "send_transaction",
  "details": {...}
}
```

**RLS Policies:**

```sql
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own events
CREATE POLICY "Users can view their own events" ON analytics_events
  FOR SELECT
  USING (
    wallet_address = current_setting('app.current_wallet_address', true)
    OR wallet_address IS NULL
  );

-- Anyone can insert events (for anonymous tracking)
CREATE POLICY "Anyone can insert events" ON analytics_events
  FOR INSERT
  WITH CHECK (true);
```

## Database Functions

### Auto-update timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Auto-update message count

```sql
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
    SET message_count = message_count - 1,
        updated_at = NOW()
    WHERE id = OLD.session_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_message_count_on_insert
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_session_message_count();

CREATE TRIGGER update_message_count_on_delete
  AFTER DELETE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_session_message_count();
```

## API Integration

### Setting up authentication context

When a user connects their wallet, set the session variable:

```typescript
// In your API routes or Supabase client
const setWalletContext = async (walletAddress: string) => {
	await supabase.rpc('set_config', {
		setting: 'app.current_wallet_address',
		value: walletAddress
	});
};
```

### Example Queries

**Create user on wallet connect:**

```typescript
const { data, error } = await supabase
	.from('users')
	.upsert({
		wallet_address: walletAddress,
		last_seen: new Date().toISOString()
	})
	.select()
	.single();
```

**Create chat session:**

```typescript
const { data, error } = await supabase
	.from('chat_sessions')
	.insert({
		user_id: userId,
		wallet_address: walletAddress,
		title: 'New conversation'
	})
	.select()
	.single();
```

**Save chat message:**

```typescript
const { error } = await supabase.from('chat_messages').insert({
	session_id: sessionId,
	role: 'user',
	content: messageContent
});
```

**Load user preferences:**

```typescript
const { data, error } = await supabase
	.from('user_preferences')
	.select('preferences')
	.eq('wallet_address', walletAddress)
	.single();
```

**Track analytics event:**

```typescript
const { error } = await supabase.from('analytics_events').insert({
	user_id: userId,
	wallet_address: walletAddress,
	event_type: 'wallet_connect',
	event_data: { walletType: 'Pera', network: 'testnet' },
	session_id: browserSessionId
});
```

## Migration Strategy

When implementing Supabase:

1. **Phase 1**: Set up database and tables
2. **Phase 2**: Implement API routes for data access
3. **Phase 3**: Create Supabase client utilities
4. **Phase 4**: Migrate stores to use Supabase instead of localStorage
5. **Phase 5**: Implement real-time subscriptions for collaborative features

## Security Considerations

1. **Never store private keys or mnemonics**
2. **Use RLS policies to isolate user data**
3. **Validate wallet signatures for write operations**
4. **Sanitize all user input**
5. **Use prepared statements/parameterized queries**
6. **Rate limit API endpoints**
7. **Implement CORS properly**
8. **Use HTTPS only**

## Performance Optimization

1. **Indexes**: All frequently queried columns are indexed
2. **Partitioning**: Consider partitioning analytics_events by date for large datasets
3. **Archiving**: Archive old chat sessions and analytics after 90 days
4. **Caching**: Cache user preferences and session lists in application
5. **Batch operations**: Batch insert analytics events
6. **Connection pooling**: Use Supabase connection pooler

## Backup and Maintenance

1. **Daily backups**: Automatic via Supabase
2. **Point-in-time recovery**: Available with Supabase Pro
3. **Vacuum**: Regular maintenance handled by Supabase
4. **Monitor**: Track query performance and table sizes
