# Sentinel — AI Web3 Safety Platform

## Short Summary

AI-powered Web3 safety platform using Algorand blockchain to create immutable records of harmful content incidents for family and organizational protection.

## Full Description

Sentinel addresses the critical problem of **digital safety and accountability** in Web3 environments by creating a transparent, immutable system for recording and verifying harmful content incidents. The platform solves three key problems:

1. **Lack of Transparency in AI Moderation**: Current AI moderation systems operate as "black boxes" with no verifiable record of decisions or incidents.

2. **Privacy vs. Accountability Trade-off**: Traditional systems either expose sensitive content publicly or keep everything private, making verification impossible.

3. **Fragmented Safety Data**: Family and organizational safety data is scattered across platforms with no unified, verifiable record.

**How Algorand Enables the Solution:**

Sentinel leverages Algorand's unique features to create a revolutionary safety infrastructure:

- **Box Storage**: Uses Algorand's Box Storage feature to efficiently store incident records with dynamic sizing, allowing for scalable incident management without bloating the blockchain.

- **ARC4 ABI**: Implements the ARC4 ABI standard for type-safe smart contract interactions, ensuring reliable data encoding/decoding of complex incident structures.

- **Low-Cost Transactions**: Algorand's minimal transaction fees make it economically viable to record every safety incident on-chain, creating comprehensive audit trails.

- **Fast Finality**: Near-instant transaction finality ensures real-time safety incident recording and immediate verification capabilities.

- **Pure Proof-of-Stake**: Algorand's secure consensus mechanism provides the trustless, decentralized foundation needed for verifiable safety records.

The platform creates a **hybrid architecture** where sensitive content remains private (stored in Supabase with encryption), while cryptographic proofs and incident metadata are recorded immutably on Algorand. This enables families and organizations to maintain privacy while having verifiable, tamper-proof records of safety incidents.

## Technical Description

**SDKs and Technologies Used:**

- **Algorand Python SDK (algopy)**: For smart contract development using the latest ARC4 ABI standard
- **Algorand JavaScript SDK**: For frontend wallet integration and transaction signing
- **SvelteKit**: Modern web framework for the user interface
- **Supabase**: Backend-as-a-Service for authentication, database, and real-time features
- **OpenAI Moderation API**: AI-powered content analysis and classification

**Unique Algorand Features That Made This Possible:**

1. **Box Storage with Dynamic Sizing**: Unlike traditional blockchain storage, Algorand's Box Storage allows our smart contract to store variable-sized incident records efficiently. Each incident is stored in its own box with a unique key, enabling O(1) lookups and scalable storage.

2. **ARC4 ABI Type Safety**: The ARC4 ABI standard provides compile-time type checking and automatic serialization/deserialization of complex data structures. This ensures data integrity when storing and retrieving incident records.

3. **Low Transaction Costs**: Algorand's minimal fees (typically <$0.001 per transaction) make it economically feasible to record every safety incident on-chain, creating comprehensive audit trails that would be prohibitively expensive on other blockchains.

4. **Fast Finality**: Algorand's 4-second finality ensures that safety incidents are recorded and verified in near real-time, critical for family safety applications.

5. **Pure Proof-of-Stake Security**: Algorand's secure consensus provides the trustless foundation needed for verifiable safety records without the environmental concerns of proof-of-work systems.

**Smart Contract Architecture:**

The `SentinelModeration` smart contract uses a sophisticated incident recording system:

- **IncidentRecord Struct**: Stores comprehensive incident data including content hashes, severity levels, and policy versions
- **Box-based Storage**: Each incident gets its own storage box for efficient retrieval and management
- **Batch Operations**: Support for recording multiple incidents in a single transaction for efficiency
- **Verification Methods**: Cryptographic verification of incident authenticity and content integrity

This architecture would not be possible on traditional blockchains due to storage limitations, high costs, or lack of type safety features.

## Presentation

**Canva Presentation Link:** [Canva presentation slides](https://www.canva.com/design/DAG2IvW4afc/228IdAVSLtzTTMJkF8TdOg/edit)

_Note: Presentation includes slides on team, problem statement, solution architecture, Algorand integration, and demo walkthrough._

---

## Goals

1. **Protect families and communities online** by automatically detecting and flagging harmful or inappropriate content.
2. **Create transparency and accountability** using blockchain technology to record malicious activity in an immutable, tamper-proof ledger.
3. **Empower parents and organisations** with real-time dashboards, analytics, and verifiable safety reports.
4. **Balance transparency and privacy** by combining cryptographic hashing, secure off-chain storage, and selective on-chain commitments.

---

## Core Mechanism

### 1. AI Moderation

Sentinel integrates OpenAI’s Moderation API to analyse messages and content in real-time. Each chat message or activity is evaluated for potential harm such as hate speech, harassment, self-harm indicators, or explicit material.

- The moderation service assigns a **severity score** and **category** to each flagged event.
- Family administrators (parents) or organisation leaders are notified through the dashboard.
- All detected events are summarised in safety metrics (e.g., 95.6% safe interactions, flagged messages per user, category breakdowns).

### 2. Supabase — Secure Off-Chain Storage

Supabase provides the backbone for **user management**, **auth**, and **private data storage**.

- **User Authentication:** Email/password authentication with Supabase Auth, with optional wallet connection for Web3 features.
- **User Accounts & Roles:** Parent, child, or organisational member roles are handled via Supabase Auth with Row-Level Security (RLS).
- **Event & Incident Logs:** All moderation events are stored securely in Postgres tables with **Row-Level Security (RLS)** enabled, ensuring each user can only access their own data.
- **Analytics:** The family dashboard aggregates this data to visualise safety trends and behavioural insights.

### 3. Algorand Blockchain — Immutable Public Proof

When harmful content is detected, Sentinel records a **proof of the incident** on the Algorand blockchain. This creates an immutable, verifiable record without exposing personal information.

**Stored On-Chain (Public):**

- A hashed content fingerprint (not the raw text)
- User wallet address or alias
- Timestamp of the incident
- Severity level & content category
- Policy version used for moderation

**Stored Off-Chain (Private):**

- The actual message text or file
- User personal information
- Family/organisation identifiers

This architecture ensures that **privacy is preserved**, yet every serious incident leaves a **tamper-proof trace** for transparency and accountability.

### 4. Wallet Integration

Families and users can connect their **Pera** or **Defly** Algorand wallets. This allows:

- Secure on-chain identity (user-controlled keys)
- Verifiable record ownership
- Transparent, decentralised safety reporting

For younger or non-technical users, Sentinel can also operate in **custodial mode**, where the app records incidents on behalf of the family’s main wallet.

---

## How It Works — Step-by-Step

1. **User Interaction:** A user sends a message in the chat interface.
2. **Moderation Check:** The backend calls OpenAI’s Moderation API.
3. **Incident Detection:** If flagged, the incident is logged in Supabase with severity and category.
4. **Blockchain Recording:** A lightweight transaction is sent to Algorand, storing a cryptographic hash of the content and moderation data.
5. **Analytics Update:** The dashboard updates safety scores and provides verified on-chain links for each incident.
6. **Parent / Admin Notification:** Parents or managers receive alerts and can review both off-chain context and on-chain proof.

---

## Benefits

### For Families

- **Peace of Mind:** Parents gain clear visibility into children’s digital interactions.
- **Immutable Trust:** Incidents are recorded transparently on the blockchain—no one can alter or erase them.
- **Privacy Protection:** Sensitive data stays encrypted and off-chain; only proofs are public.
- **Education & Growth:** The dashboard helps families understand risk trends and discuss online behaviour constructively.

### For Teams & Organisations

- **Accountability Framework:** Teams can build verifiable moderation and conduct tracking systems.
- **Compliance & Audit Readiness:** Blockchain-backed reports can be used for internal compliance or HR audits.
- **Custom Policy Support:** Organisations can deploy tailored moderation models and policy versions.

### For the Web3 Ecosystem

- **Transparency in AI Moderation:** Sentinel introduces auditable AI behaviour to decentralised applications.
- **Cross-App Interoperability:** Any app can plug into Sentinel’s API to benefit from verifiable moderation proofs.
- **Reputation & Safety Layer:** Creates a decentralised trust layer that can attach to user wallets or dApps.

---

## Authentication Flow

Sentinel uses a **hybrid authentication system** that combines traditional email/password authentication with optional Web3 wallet connection:

### 1. User Registration & Login

- Users sign up with **email and password** using Supabase Auth
- Full name and profile information are collected during registration
- Email verification is handled by Supabase

### 2. Wallet Connection (Optional)

- After authentication, users can **optionally connect their Algorand wallet**
- Wallet connection is required for Web3 features like blockchain incident submission
- One wallet address per user account (enforced at database level)
- Wallet connection status is displayed in the user interface

### 3. Data Access & Security

- All user data is protected by **Row-Level Security (RLS)** policies
- Users can only access their own data and associated wallet information
- Wallet addresses are stored securely and linked to authenticated user accounts

### 4. Session Management

- Sessions are managed by Supabase Auth with automatic refresh
- Protected routes redirect unauthenticated users to login
- Wallet connection persists across sessions when user is authenticated

---

## Security & Privacy Design

- **No raw content on-chain** — only cryptographic hashes.
- **Encrypted off-chain storage** in Supabase with user-level access.
- **RLS policies** to restrict visibility per user or family group.
- **Hot wallet signing only for system proofs**; users can opt into self-signed wallet verification.
- **Transparency commitments**: periodic privacy audits, open-source policy versioning, and public Merkle roots of moderation models.

---

## Environment Configuration

To run Sentinel, you'll need to configure the following environment variables:

```bash
# Algorand Smart Contract Configuration
PUBLIC_ALGORAND_APP_ID=0                    # Your deployed smart contract application ID
PUBLIC_ALGORAND_NETWORK=testnet             # Network: 'testnet' or 'mainnet'

# OpenAI API Key for Moderation
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Smart Contract Setup

1. Deploy your smart contract to Algorand testnet/mainnet
2. Set `ALGORAND_APP_ID` to your deployed application ID
3. Ensure your smart contract has a `submit_incident` method with the following signature:
   - `incident_id` (string)
   - `wallet_address` (address)
   - `content_hash` (byte[])
   - `severity_level` (uint8)
   - `category` (string)
   - `policy_version` (string)
   - `action_taken` (string)

---

## Vision

Sentinel aims to become the **Web3 safety infrastructure** for digital families and ethical organisations — a bridge between AI’s ability to detect harm and blockchain’s ability to guarantee integrity.

By giving users control, visibility, and immutable proofs, Sentinel builds **a new standard of digital trust** — where safety and transparency no longer require sacrificing privacy.

---

## Project Demo & Documentation

### Demo Video

[Link to demo video](https://drive.google.com/file/d/1I3aJTsfcqRJnhHbdzTzjzYO2tTzESKUZ/view?usp=sharing)

### Screenshots

#### Dashboard Overview

![Dashboard Screenshot](/screenshots/dashboard.png)

#### Chat Interface with Moderation

![Chat Interface Screenshot](/screenshots/chat-interface.png)

#### Incident Analytics

![Analytics Screenshot](/screenshots/analytics.png)

#### Wallet Integration

![Wallet Integration Screenshot](/screenshots/wallet-integration.png)

### Smart Contract Description

The `SentinelModeration` smart contract (`contract.py`) implements a sophisticated incident recording system using Algorand's advanced features:

#### Core Functionality

**1. Incident Recording (`record_incident`)**

- Records moderation incidents with comprehensive metadata
- Validates severity levels (1-3 scale)
- Ensures unique incident IDs using Box Storage
- Stores structured data using ARC4 types for type safety
- Updates global incident counter
- Logs incident ID and content hash for transparency

**2. Data Structure (`IncidentRecord`)**

```python
class IncidentRecord(Struct):
    incident_id: ARC4String      # Unique identifier
    wallet_address: Address      # Offending user's wallet
    timestamp: UInt64           # Unix timestamp
    content_hash: DynamicBytes  # SHA-256 hash of content
    severity_level: UInt8       # 1=low, 2=medium, 3=high
    category: ARC4String        # Violation category
    policy_version: ARC4String  # Moderation policy version
    action_taken: ARC4String    # Action taken (warned, blocked, etc.)
```

**3. Box Storage Implementation**

- Each incident stored in its own Box with unique key (`inc_" + incident_id`)
- Dynamic box sizing based on incident data size
- Safety cap of 2048 bytes per incident
- O(1) lookup time for incident retrieval

**4. Verification Methods**

- `get_incident`: Retrieves complete incident record
- `verify_incident`: Cryptographically verifies incident authenticity
- `get_contract_info`: Returns contract version and total incident count

**5. Batch Operations**

- `batch_record_incidents`: Placeholder for efficient bulk incident recording
- Designed for high-volume, low-severity incidents

#### Key Algorand Features Utilized

1. **Box Storage**: Enables efficient, scalable storage of variable-sized incident records
2. **ARC4 ABI**: Provides type-safe serialization/deserialization of complex data structures
3. **Dynamic Bytes**: Supports variable-length content hashes and metadata
4. **Address Types**: Native support for Algorand wallet addresses
5. **Global State**: Maintains contract-level counters and versioning

#### Security Features

- **Content Hashing**: Only cryptographic hashes stored on-chain, never raw content
- **Unique ID Enforcement**: Prevents duplicate incident recording
- **Severity Validation**: Ensures severity levels are within acceptable range
- **Size Limits**: Prevents storage abuse with safety caps
- **Immutable Records**: Once recorded, incidents cannot be modified or deleted

### Block Explorer Link

**Deployed Smart Contract on Algorand Asset Hub:**
[PLACEHOLDER - Link to block explorer showing deployed contract](https://testnet.algoexplorer.io/application/748005351)
