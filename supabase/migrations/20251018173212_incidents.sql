-- incidents
create table if not exists incidents (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
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