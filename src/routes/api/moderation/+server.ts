// src/routes/api/moderation/+server.ts
import type { RequestHandler } from "./$types";
import { ModerateRequest, ModerateResponse } from "$lib/moderation/schema";
import { moderate } from "$lib/moderation/engine";
import { createIncident } from "$lib/supabase/incidents";
import { getSupabaseClient } from "$lib/supabase/client";

// Severity policy:
// 0 = clean
// 1 = low (mild profanity, harassment) → allow but flag
// 2 = medium (targeted harassment, sexual content) → block
// 3 = high (self-harm, grooming, explicit/minors, violent threats) → block

export const POST: RequestHandler = async (
    { request, locals, fetch },
) => {
    // Parse and validate request
    let body;
    try {
        body = ModerateRequest.parse(await request.json());
    } catch {
        // Return clean status for invalid requests (empty text, etc.)
        const out = ModerateResponse.parse({
            allowed: true,
            action: "allow",
            severity: 0,
            category: "clean",
        });
        return new Response(JSON.stringify(out), { status: 200 });
    }

    const { text, sessionId, messageId, from, wallet, policyVersion } = body;

    // Log incoming moderation request (concise)
    console.log(
        `🔍 Moderating [${from}] message ${
            messageId.slice(0, 8)
        }... (${text.length} chars)`,
    );

    // Safety check: if text is empty or whitespace only, return clean
    if (!text || text.trim().length === 0) {
        console.log(`   ✅ Empty/whitespace - allowing`);
        const out = ModerateResponse.parse({
            allowed: true,
            action: "allow",
            severity: 0,
            category: "clean",
        });
        return new Response(JSON.stringify(out), { status: 200 });
    }

    // Run moderation
    const result = await moderate(text);

    // Flagged content - determine action based on severity
    const shouldBlock = result.severity >= 2;

    const resp = ModerateResponse.parse({
        allowed: !shouldBlock,
        action: shouldBlock ? "block" : "allow",
        reason: result.category,
        severity: result.severity,
        category: result.category,
    });

    // Log moderation result (concise)
    const actionIcon = shouldBlock ? "🚫" : result.flagged ? "⚠️" : "✅";
    console.log(
        `   ${actionIcon} ${resp.action.toUpperCase()} - ${result.category} (severity: ${result.severity})`,
    );

    // Save incident to Supabase if flagged or severity >= 1
    if (result.flagged || result.severity >= 1) {
        try {
            const supabase = getSupabaseClient(locals);

            // Create incident record in database
            const incident = await createIncident(supabase, {
                session_id: sessionId,
                message_id: messageId,
                from_side: from,
                wallet_address: wallet,
                content: text,
                severity: result.severity,
                category: result.category,
                policy_version: policyVersion || "v1",
                action: shouldBlock ? "block" : "allow",
            });

            console.log(
                `   💾 Incident saved: ${
                    incident.id.slice(0, 8)
                }... [${incident.chain_status}]`,
            );

            // High-severity incidents remain in 'pending' state
            // User can manually submit to blockchain via UI with wallet signature
            if (result.severity >= 2 && wallet) {
                console.log(
                    `   ℹ️  High-severity incident - eligible for blockchain submission`,
                );
            }

            // TODO: Implement frontend-triggered blockchain submission
            // The frontend can call /api/incidents/submit-chain with wallet signature
            // Or implement a background job queue with service wallet
        } catch (error) {
            console.error(
                `   ❌ Failed to save incident:`,
                error instanceof Error ? error.message : error,
            );
            // Don't fail the moderation response if database save fails
            // The moderation decision is still valid
        }
    }

    return new Response(JSON.stringify(resp), { status: 200 });
};
