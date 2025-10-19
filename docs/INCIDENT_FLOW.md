# Incident Handling Flow Documentation

This document explains the complete flow of chat messages through moderation, incident logging, and blockchain submission in the Sentinel application.

## Overview

The system implements a multi-stage pipeline:

1. **Chat** - User/AI messages in chat interface
2. **Moderation** - Content moderation via OpenAI API
3. **Incident Storage** - Flagged content saved to Supabase
4. **Blockchain Submission** - High-severity incidents recorded on Algorand

---

## 1. Chat Interface Flow

### Location

- **Frontend**: `/src/routes/(app)/chat/+page.svelte`
- **Backend**: `/src/routes/api/chat/+server.ts`

### Components Used

- **Chat Store**: `/src/lib/stores/chat.store.svelte.ts`
- **User Store**: `/src/lib/stores/user.store.svelte.ts`
- **Wallet Store**: `/src/lib/stores/wallet.store.svelte.ts`

### Flow

```
User Types Message
       ↓
[Chat Component] (chat/+page.svelte)
       ↓
Creates message with unique messageId
       ↓
Sends to AI via Vercel AI SDK
       ↓
[Chat API] (/api/chat/+server.ts)
       ↓
Streams response from OpenAI GPT-4
       ↓
Returns to frontend
       ↓
Triggers moderation for BOTH messages
```

### Key Code Points

**Message Creation** (chat/+page.svelte, lines 92-120):

```javascript
onMount(() => {
	chat = new Chat({
		onFinish: async ({ message }) => {
			// AI message complete - now moderate it
			const completeMessage = chatStore.fromUIMessage(message);
			if (completeMessage.content && completeMessage.content.trim().length > 0) {
				await moderateMessage(completeMessage.id, completeMessage.content, 'ai');
			}
		}
	});
});
```

**User Message Moderation** (chat/+page.svelte, lines 200-220):

```javascript
async function sendMessage() {
	// User sends message
	const message = chatStore.addMessage(input, 'user');

	// Immediately moderate user's message
	moderateMessage(message.id, input, 'user');

	// Continue with AI generation...
}
```

---

## 2. Moderation API Flow

### Location

- **API Endpoint**: `/src/routes/api/moderation/+server.ts`
- **Engine**: `/src/lib/moderation/engine.ts`
- **Schema**: `/src/lib/moderation/schema.ts`

### Flow

```
Chat Component calls /api/moderation
       ↓
[Moderation API] (+server.ts)
       ↓
Validates request (ModerateRequest schema)
       ↓
Calls OpenAI Moderation API
       ↓
[Moderation Engine] (engine.ts)
       ↓
Maps OpenAI categories to severity levels:
  - 0: Clean
  - 1: Low (allow + flag)
  - 2: Medium (block)
  - 3: High (block)
       ↓
Returns to API handler
       ↓
If flagged (severity ≥ 1):
  → Save incident to Supabase
       ↓
Return moderation result to frontend
```

### Request Schema

```typescript
{
    text: string,           // Content to moderate
    sessionId: string,      // Chat session ID
    messageId: string,      // Unique message ID
    from: 'user' | 'ai',   // Message source
    wallet?: string,        // Optional wallet address
    policyVersion: string   // Moderation policy version
}
```

### Response Schema

```typescript
{
    allowed: boolean,       // Can display message?
    action: 'allow' | 'block',
    severity: 0 | 1 | 2 | 3,
    category: string,       // e.g., 'hate', 'violence', 'sexual'
    reason?: string
}
```

### Severity Mapping (engine.ts, lines 37-74)

| OpenAI Category            | Mapped Category | Severity | Action       |
| -------------------------- | --------------- | -------- | ------------ |
| self-harm                  | self_harm       | 3        | Block        |
| sexual/minors              | sexual_minors   | 3        | Block        |
| hate, hate/threatening     | hate            | 2        | Block        |
| violence, violence/graphic | violence        | 2        | Block        |
| sexual                     | sexual          | 2        | Block        |
| harassment                 | harassment      | 2        | Block        |
| Other flagged              | other           | 1        | Allow + Flag |
| Not flagged                | clean           | 0        | Allow        |

---

## 3. Incident Storage Flow

### Location

- **Storage Functions**: `/src/lib/supabase/incidents.ts`
- **Database Client**: `/src/lib/supabase/client.ts`
- **Database Schema**: `/supabase/migrations/20251018173212_incidents.sql`

### Flow

```
Moderation API detects flagged content
       ↓
Calls createIncident()
       ↓
[Incident Storage] (supabase/incidents.ts)
       ↓
Computes SHA-256 hash of content
       ↓
Converts to PostgreSQL bytea format (\\x prefix)
       ↓
Inserts into Supabase 'incidents' table:
  - session_id
  - message_id (unique constraint)
  - from_side ('user' | 'ai')
  - wallet_address
  - content_hash (bytea)
  - severity (0-3)
  - category
  - policy_version
  - action ('allow' | 'block')
  - chain_status ('pending')
       ↓
Returns incident ID and status
       ↓
If duplicate (same session_id + message_id):
  → Returns existing incident (idempotency)
```

### Database Schema

**Table**: `incidents`

| Column         | Type        | Description                                   |
| -------------- | ----------- | --------------------------------------------- |
| id             | uuid        | Primary key                                   |
| session_id     | uuid        | References chat_sessions                      |
| message_id     | text        | Message identifier (unique per session)       |
| from_side      | text        | 'user' or 'ai'                                |
| wallet_address | text        | Optional wallet address                       |
| ts             | timestamptz | Timestamp                                     |
| content_hash   | bytea       | SHA-256 hash of content                       |
| severity       | int         | 0-3 severity level                            |
| category       | text        | Moderation category                           |
| policy_version | text        | Policy version used                           |
| action         | text        | 'allow', 'block', or 'truncated'              |
| tx_id          | text        | Algorand transaction ID (nullable)            |
| chain_status   | text        | 'pending', 'submitted', 'confirmed', 'failed' |

**Constraints**:

- Unique: (session_id, message_id) - Ensures idempotency
- Foreign Key: session_id → chat_sessions(id)

### Content Hash Generation (incidents.ts, lines 37-46)

```typescript
// Compute SHA-256 hash of content
const encoder = new TextEncoder();
const dataBuffer = encoder.encode(data.content);
const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

// Convert to PostgreSQL bytea format
const hashHex = Array.from(new Uint8Array(hashBuffer))
	.map((b) => b.toString(16).padStart(2, '0'))
	.join('');
const contentHashBytea = `\\x${hashHex}`;
```

---

## 4. Blockchain Submission Flow

### Location

- **API Endpoint**: `/src/routes/api/incidents/submit-chain/+server.ts`
- **Blockchain Functions**: `/src/lib/algorand/incidents.ts`
- **Algorand Client**: `/src/lib/algorand/client.ts`
- **Configuration**: `/src/lib/algorand/config.ts`

### Flow

```
Manual/Automated trigger to submit incident
       ↓
POST /api/incidents/submit-chain
       ↓
[Submit Chain API] (submit-chain/+server.ts)
       ↓
Validates:
  1. Blockchain configured (APP_ID set)
  2. User authenticated
  3. Wallet address matches user
  4. Incident exists
  5. Incident not already submitted
       ↓
Fetches incident from Supabase
       ↓
Converts content_hash (bytea → hex)
       ↓
Formats incident for blockchain
       ↓
[Algorand Client] (algorand/client.ts)
       ↓
Calls smart contract ABI method:
  submit_incident(
    incident_id,
    wallet_address,
    content_hash,
    severity_level,
    category,
    policy_version,
    action_taken
  )
       ↓
Submits transaction to Algorand
       ↓
If successful:
  → Updates incident.chain_status = 'submitted'
  → Updates incident.tx_id = transaction_id
       ↓
If failed:
  → Updates incident.chain_status = 'failed'
       ↓
Returns result to caller
```

### Smart Contract Configuration (config.ts)

**Environment Variables**:

- `ALGORAND_APP_ID` - Smart contract application ID (required)
- `ALGORAND_NETWORK` - 'testnet' or 'mainnet' (default: testnet)

**Validation**:

```typescript
// Warns if APP_ID not set (defaults to 0)
isBlockchainConfigured(); // Returns false if APP_ID = 0
```

### Transaction Submission (client.ts, lines 288-346)

```typescript
async submitIncidentToContract(params: {
    sender: string;
    appId: number;
    incidentId: string;
    walletAddress: string;
    contentHash: Uint8Array;
    severity: number;
    category: string;
    policyVersion: string;
    actionTaken: string;
}): Promise<{ txId: string; success: boolean; error?: string }>
```

**ABI Method Definition**:

```typescript
{
    name: "submit_incident",
    args: [
        { name: "incident_id", type: "string" },
        { name: "wallet_address", type: "address" },
        { name: "content_hash", type: "byte[]" },
        { name: "severity_level", type: "uint8" },
        { name: "category", type: "string" },
        { name: "policy_version", type: "string" },
        { name: "action_taken", type: "string" },
    ],
    returns: { type: "void" },
}
```

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                         │
└─────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: CHAT                                                    │
│  Location: /routes/(app)/chat/+page.svelte                      │
│  ────────────────────────────────────────────────────────────   │
│  • User types message                                            │
│  • Message sent to /api/chat                                     │
│  • AI response streamed back                                     │
│  • Both messages get unique IDs                                  │
└─────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: MODERATION                                              │
│  Location: /routes/api/moderation/+server.ts                    │
│  ────────────────────────────────────────────────────────────   │
│  • Receives: text, sessionId, messageId, from, wallet            │
│  • Calls OpenAI Moderation API                                   │
│  • Maps categories to severity (0-3)                             │
│  • Returns: allowed, action, severity, category                  │
└─────────────────────────────────────────────────────────────────┘
                                 ↓
                    ┌────────────┴────────────┐
                    ↓                         ↓
            Severity = 0              Severity ≥ 1
               (Clean)                  (Flagged)
                    ↓                         ↓
              Allow Message      ┌────────────────────────┐
                                 │  STEP 3: SAVE INCIDENT │
                                 │  Location: lib/supabase/incidents.ts
                                 │  ─────────────────────
                                 │  • Compute SHA-256 hash
                                 │  • Insert to Supabase
                                 │  • Status: 'pending'
                                 │  • Return incident ID
                                 └────────────────────────┘
                                          ↓
                              ┌──────────┴──────────┐
                              ↓                     ↓
                       Severity < 2           Severity ≥ 2
                      (Allow + Flag)            (Block)
                              ↓                     ↓
                       Display Message      Block Message
                                                    ↓
                                         [Optional: Auto-submit
                                          to blockchain]

┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: BLOCKCHAIN SUBMISSION (Manual or Triggered)             │
│  Location: /routes/api/incidents/submit-chain/+server.ts        │
│  ────────────────────────────────────────────────────────────   │
│  • Validates blockchain configuration                            │
│  • Verifies user ownership                                       │
│  • Fetches incident from database                                │
│  • Formats data for smart contract                               │
│  • Submits to Algorand blockchain                                │
│  • Updates incident status: 'submitted' or 'failed'              │
│  • Records transaction ID                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints Summary

| Endpoint                      | Method   | Purpose                  | Authentication |
| ----------------------------- | -------- | ------------------------ | -------------- |
| `/api/chat`                   | POST     | Stream AI chat responses | Optional       |
| `/api/moderation`             | POST     | Moderate content         | Optional       |
| `/api/incidents/submit-chain` | POST     | Submit to blockchain     | Required       |
| `/api/chat/sessions`          | GET/POST | Manage chat sessions     | Required       |
| `/api/chat/messages`          | GET      | Fetch chat history       | Required       |

---

## Key Files Reference

### Frontend

- `/src/routes/(app)/chat/+page.svelte` - Chat interface
- `/src/lib/stores/chat.store.svelte.ts` - Chat state management
- `/src/lib/stores/wallet.store.svelte.ts` - Wallet state

### Backend APIs

- `/src/routes/api/chat/+server.ts` - AI chat endpoint
- `/src/routes/api/moderation/+server.ts` - Moderation endpoint
- `/src/routes/api/incidents/submit-chain/+server.ts` - Blockchain submission

### Libraries

- `/src/lib/moderation/engine.ts` - OpenAI moderation wrapper
- `/src/lib/supabase/incidents.ts` - Incident storage functions
- `/src/lib/algorand/client.ts` - Algorand blockchain client
- `/src/lib/algorand/incidents.ts` - Blockchain incident formatting
- `/src/lib/algorand/config.ts` - Smart contract configuration

### Database

- `/supabase/migrations/20251018173212_incidents.sql` - Incidents table schema

---

## Environment Variables Required

```bash
# OpenAI (Required for moderation)
OPENAI_API_KEY=sk-...

# Supabase (Required for incident storage)
PUBLIC_SUPABASE_URL=https://...
PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Algorand (Required for blockchain submission)
ALGORAND_APP_ID=123456789        # Smart contract ID
ALGORAND_NETWORK=testnet         # or 'mainnet'
```

---

## Testing the Flow

### 1. Test Chat → Moderation

```bash
# Start development server
npm run dev

# Open http://localhost:5173/chat
# Connect wallet
# Send a message
# Check browser console for moderation logs
```

### 2. Test Incident Storage

```bash
# Send a flagged message (e.g., containing profanity)
# Check Supabase dashboard → incidents table
# Verify record created with:
#   - Correct session_id
#   - SHA-256 content_hash
#   - chain_status = 'pending'
```

### 3. Test Blockchain Submission

```bash
# Requires ALGORAND_APP_ID to be set
# Manually trigger via API:
curl -X POST http://localhost:5173/api/incidents/submit-chain \
  -H "Content-Type: application/json" \
  -d '{
    "incident_id": "uuid-here",
    "wallet_address": "ALGORAND_ADDRESS"
  }'

# Check response for tx_id
# Verify on AlgoExplorer: https://testnet.algoexplorer.io/tx/{tx_id}
```

---

## Security Considerations

### 1. Content Privacy

- Only SHA-256 hash stored on blockchain (not actual content)
- Full content never leaves your database
- Hash proves content integrity without revealing it

### 2. Authentication

- Blockchain submission requires authenticated user
- Wallet address must match authenticated user
- Row-level security on incidents table

### 3. Idempotency

- Duplicate incidents prevented via (session_id, message_id) constraint
- Same message won't be moderated/stored twice

### 4. Rate Limiting

- Consider adding rate limits to moderation API
- OpenAI has built-in rate limits

---

## Common Issues & Solutions

### Issue: "ALGORAND_APP_ID not set"

**Solution**: Set environment variable in `.env`:

```bash
ALGORAND_APP_ID=your_app_id_here
```

### Issue: "content_hash format error"

**Solution**: Ensure Supabase returns bytea as expected format. The code handles multiple formats automatically.

### Issue: "Failed to create incident: duplicate key"

**Solution**: This is expected behavior (idempotency). The system returns the existing incident.

### Issue: Moderation not triggering

**Solution**: Check browser console for errors. Verify OPENAI_API_KEY is set correctly.

---

## Future Enhancements

1. **Automatic Blockchain Submission**
   - Background job for high-severity incidents
   - Use platform's `waitUntil` for async processing

2. **Incident Dashboard**
   - View all incidents for wallet
   - Manual blockchain submission UI
   - Verify incidents on blockchain

3. **Appeal System**
   - Users can appeal blocked messages
   - Admin review interface

4. **Analytics**
   - Track moderation statistics
   - Category trends over time
   - Blockchain submission success rates

---

## Conclusion

The incident handling system provides a robust pipeline from user interaction to blockchain permanence:

1. ✅ **Chat**: Real-time messaging with AI
2. ✅ **Moderation**: OpenAI-powered content filtering
3. ✅ **Storage**: Secure incident logging in Supabase
4. ✅ **Blockchain**: Immutable record on Algorand

All components are modular, type-safe, and production-ready.
