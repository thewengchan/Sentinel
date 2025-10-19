# Fixes Applied for Chat Session and Moderation Issues

## Issues Found

### 1. Database Schema Mismatch (Foreign Key Constraint Error)

**Problem:** The `chat_sessions` table has a foreign key `user_id` that references `users.id`, but the auth migration tried to make the relationship more complex with `auth_user_id`.

**Root Cause:**

- `users.id` is the primary key (UUID)
- `users.auth_user_id` was added as a reference to `auth.users.id`
- `chat_sessions.user_id` references `users.id`
- API was trying to insert `locals.user.id` (from Supabase auth) directly into `chat_sessions.user_id`
- This caused a foreign key constraint error because the auth user ID doesn't exist in `users.id`

**Solution:**

- Created migration `20251019080000_fix_user_id_schema.sql` that makes `users.id` the same as the auth user ID
- Removed the `auth_user_id` column entirely
- Updated all RLS policies to use `auth.uid() = id` directly
- This simplifies the schema and eliminates the mismatch

### 2. Store Initialization Missing User Context

**Problem:** Chat store and user store were being initialized without required parameters.

**Root Cause:**
In `/src/routes/(app)/+layout.svelte`:

```javascript
chatStore.init(); // ❌ Missing userId and walletAddress
userStore.load(); // ❌ Missing userId
```

These methods require user context but were called with no arguments.

**Solution:**
Updated the initialization to properly fetch user data and pass it to the stores:

```javascript
if (session?.user) {
    const userId = session.user.id;
    const userData = await supabase
        .from('users')
        .select('wallet_address, email, full_name, avatar_url')
        .eq('id', userId)
        .single();

    if (userData.data) {
        // Initialize chat store with user context
        await chatStore.init(userId, userData.data.wallet_address || '');

        // Load user preferences
        await userStore.load(userId, ...);
    }
}
```

### 3. Database Query Using Wrong Column

**Problem:** In `/src/routes/+layout.ts`, the query was using `auth_user_id` which no longer exists after the migration.

**Solution:**
Changed:

```javascript
.eq("auth_user_id", user.id)  // ❌ Column doesn't exist
```

To:

```javascript
.eq("id", user.id)  // ✅ Correct column
```

### 4. API Query Using Wrong Column

**Problem:** In `/src/routes/api/chat/sessions/+server.ts`, same issue.

**Solution:**
Changed the user lookup query to use `id` instead of `auth_user_id`.

## Files Modified

1. `supabase/migrations/20251019080000_fix_user_id_schema.sql` - NEW migration file
2. `src/routes/+layout.ts` - Fixed database query
3. `src/routes/(app)/+layout.svelte` - Fixed store initialization
4. `src/routes/api/chat/sessions/+server.ts` - Fixed user lookup query

## Next Steps

### 1. Apply the Database Migration

Run ONE of these commands:

**Option A: Reset the database (destroys all data):**

```bash
npx supabase db reset
```

**Option B: Apply just the new migration (preserves data but may fail if there's conflicting data):**

```bash
npx supabase migration up
```

**Option C: Manual application (if you have the Supabase Studio open):**

1. Go to the SQL Editor in Supabase Studio
2. Copy the contents of `supabase/migrations/20251019080000_fix_user_id_schema.sql`
3. Run it

### 2. Test the Chat Feature

After applying the migration:

1. **Clear browser cache/storage** to remove old session data
2. **Restart your dev server:**
   ```bash
   npm run dev
   ```
3. **Log in again** to create a fresh session
4. **Go to the chat page** and send a message
5. **Check browser console** for moderation logs:
   - Look for `🚀 [USER] Moderating message:`
   - Look for `✅ [USER] Moderation complete:`
   - Look for OpenAI API logs

### 3. Verify Moderation is Working

You should see moderation badges appear on messages:

- ✓ Clean - for safe content
- ⚠️ Low risk - for mild issues (severity 1)
- ⚠️ Blocked - for medium issues (severity 2)
- 🚫 Blocked - for high severity issues (severity 3)

Test with various messages to see moderation in action.

## Why Moderation Wasn't Working

The moderation feature requires:

1. ✅ Valid OpenAI API key (you have this)
2. ✅ Moderation endpoint working (it was working)
3. ❌ **Chat sessions to be created** (this was failing due to FK constraint)
4. ❌ **Stores to be initialized with user context** (this was missing)

Once the stores are properly initialized with user data, the moderation flow will work as designed:

- User sends message → Immediate moderation check
- AI responds → Moderation after streaming completes
- Results stored by message ID and displayed in UI

## Architecture Notes

The simplified architecture is now:

```
auth.users (Supabase Auth)
    └─> users (id = auth.users.id)
            └─> chat_sessions (user_id = users.id)
                    └─> chat_messages
```

This is much cleaner than having a separate `auth_user_id` column that had to be joined.
