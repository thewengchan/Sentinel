-- =====================================================
-- Table: incidents
-- Stores moderation incidents with blockchain integration
-- =====================================================
create table if not exists incidents (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  message_id text not null,                 -- dedupe per message
  from_side text not null check (from_side in ('user','ai')),
  wallet_address text,                      -- optional
  ts timestamptz not null default now(),
  content_hash bytea not null,              -- SHA-256(bytes)
  severity int not null,                    -- 0..3
  category text not null,
  policy_version text not null,
  action text not null,                     -- 'allow'|'block'|'truncated'
  tx_id text,                               -- algorand
  chain_status text not null default 'pending'
    check (chain_status in ('pending','submitted','confirmed','failed')),
  unique (session_id, message_id)           -- idempotency per message
);

-- Indexes for incidents table
CREATE INDEX idx_incidents_session_id ON incidents(session_id);
CREATE INDEX idx_incidents_wallet_address ON incidents(wallet_address);
CREATE INDEX idx_incidents_ts ON incidents(ts DESC);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_category ON incidents(category);
CREATE INDEX idx_incidents_chain_status ON incidents(chain_status);

-- Add comments
COMMENT ON TABLE incidents IS 'Stores moderation incidents with blockchain integration';
COMMENT ON COLUMN incidents.session_id IS 'References chat_sessions table';
COMMENT ON COLUMN incidents.message_id IS 'Message identifier for deduplication';
COMMENT ON COLUMN incidents.from_side IS 'Whether incident is from user or AI message';
COMMENT ON COLUMN incidents.wallet_address IS 'Optional wallet address associated with incident';
COMMENT ON COLUMN incidents.content_hash IS 'SHA-256 hash of the moderated content';
COMMENT ON COLUMN incidents.severity IS 'Severity level: 0=clean, 1=low, 2=medium, 3=high';
COMMENT ON COLUMN incidents.category IS 'Moderation category (hate, violence, sexual, etc.)';
COMMENT ON COLUMN incidents.policy_version IS 'Version of moderation policy used';
COMMENT ON COLUMN incidents.action IS 'Action taken: allow, block, or truncated';
COMMENT ON COLUMN incidents.tx_id IS 'Algorand transaction ID for blockchain record';
COMMENT ON COLUMN incidents.chain_status IS 'Blockchain submission status';

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on incidents table
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Users can view incidents from their own chat sessions
CREATE POLICY "Users can view incidents from their own sessions" ON incidents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = incidents.session_id
      AND chat_sessions.wallet_address = COALESCE(
        get_current_wallet_address(),
        current_setting('request.jwt.claims', true)::json->>'wallet_address'
      )
    )
  );

-- Users can insert incidents for their own sessions
CREATE POLICY "Users can insert incidents for their own sessions" ON incidents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = incidents.session_id
      AND chat_sessions.wallet_address = COALESCE(
        get_current_wallet_address(),
        current_setting('request.jwt.claims', true)::json->>'wallet_address'
      )
    )
  );

-- Users can update incidents from their own sessions
CREATE POLICY "Users can update incidents from their own sessions" ON incidents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = incidents.session_id
      AND chat_sessions.wallet_address = COALESCE(
        get_current_wallet_address(),
        current_setting('request.jwt.claims', true)::json->>'wallet_address'
      )
    )
  );