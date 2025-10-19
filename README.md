# Sentinel — AI Web3 Safety Platform

## Overview

Sentinel is a **safety-focused** Web3 application that combines **AI moderation, analytics, and blockchain transparency** to create a safer, more trustworthy digital environment for children, families, and teams. It empowers parents and organisations to monitor, verify, and understand online interactions through a system that is transparent, privacy-preserving, and immutable.

Built with **SvelteKit**, **Supabase**, **OpenAI**, and the **Algorand blockchain**, Sentinel bridges the gap between modern AI safety tools and verifiable Web3 integrity.

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
ALGORAND_APP_ID=0                    # Your deployed smart contract application ID
ALGORAND_NETWORK=testnet             # Network: 'testnet' or 'mainnet'

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
