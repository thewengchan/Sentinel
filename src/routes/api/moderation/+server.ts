// src/routes/api/moderation/+server.ts
import type { RequestHandler } from "./$types";
import { ModerateRequest, ModerateResponse } from "$lib/moderation/schema";
import { moderate } from "$lib/moderation/engine";
// import { sha256Hex } from "$lib/moderation/engine";
// import { submitIncidentToChain } from "$lib/algorand/incidents";

// Severity policy:
// 0 = clean
// 1 = low (mild profanity, harassment) → allow but flag
// 2 = medium (targeted harassment, sexual content) → block
// 3 = high (self-harm, grooming, explicit/minors, violent threats) → block

export const POST: RequestHandler = async (
    { request },
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

    const { text } = body;

    // Log incoming moderation request
    console.log("📝 Moderation Request:", {
        text: text.slice(0, 200) + (text.length > 200 ? "..." : ""),
        textLength: text.length,
        sessionId: body.sessionId,
        messageId: body.messageId,
        from: body.from,
    });

    // Safety check: if text is empty or whitespace only, return clean
    if (!text || text.trim().length === 0) {
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

    if (!result.flagged) {
        // Clean content
        const out = ModerateResponse.parse({
            allowed: true,
            action: "allow",
            severity: result.severity,
            category: result.category,
        });
        return new Response(JSON.stringify(out), { status: 200 });
    }

    // Flagged content - determine action based on severity
    const shouldBlock = result.severity >= 2;

    const resp = ModerateResponse.parse({
        allowed: !shouldBlock,
        action: shouldBlock ? "block" : "allow",
        reason: result.category,
        severity: result.severity,
        category: result.category,
    });

    // Log moderation result
    console.log("🔍 Moderation Result:", {
        flagged: result.flagged,
        category: result.category,
        severity: result.severity,
        action: resp.action,
        allowed: resp.allowed,
    });

    return new Response(JSON.stringify(resp), { status: 200 });

    // ============ BLOCKCHAIN INTEGRATION (COMMENTED OUT) ============
    // Uncomment below to enable database logging and blockchain commits

    // const { locals: { supabase } } = event;
    // const { sessionId, messageId, from, wallet, policyVersion } = body;
    // const ALWAYS_CHAIN_FOR = new Set(["self_harm", "sexual_minors"]);
    //
    // // 0) fast bail if session already blocked (optional but nice)
    // const { data: sess } = await supabase.from("sessions").select("status").eq(
    //     "id",
    //     sessionId,
    // ).single();
    // if (sess?.status === "blocked") {
    //     return new Response(
    //         JSON.stringify({
    //             allowed: false,
    //             action: "block",
    //             reason: "session_blocked",
    //         }),
    //         { status: 200 },
    //     );
    // }
    //
    // // Compute content hash
    // const contentHashHex = sha256Hex(text);
    // const now = new Date();
    //
    // // Try idempotent insert (unique(session_id,message_id))
    // const insert = await supabase.from("incidents").insert({
    //     session_id: sessionId,
    //     message_id: messageId,
    //     from_side: from,
    //     wallet_address: wallet ?? null,
    //     ts: now.toISOString(),
    //     content_hash: Buffer.from(contentHashHex.slice(2), "hex"),
    //     severity: result.severity,
    //     category: result.category,
    //     policy_version: policyVersion,
    //     action: shouldBlock ? "block" : "flag",
    //     chain_status: "pending",
    // }).select("id, chain_status").single();
    //
    // let incidentId: string | undefined = insert.data?.id;
    // if (insert.error && insert.error.message.includes("duplicate key")) {
    //     const { data: existing } = await supabase
    //         .from("incidents")
    //         .select("id, tx_id, chain_status")
    //         .eq("session_id", sessionId)
    //         .eq("message_id", messageId)
    //         .single();
    //     incidentId = existing?.id;
    // }
    //
    // // Set session status to blocked if severity >= 2
    // if (shouldBlock) {
    //     await supabase.from("sessions").update({
    //         status: "blocked",
    //         blocked_at: now.toISOString(),
    //     }).eq("id", sessionId);
    // }
    //
    // // Async chain commit for high severity
    // if (ALWAYS_CHAIN_FOR.has(result.category) || result.severity >= 2) {
    //     const waitUntil = (event.platform as any)?.context?.waitUntil?.bind(
    //         (event.platform as any)?.context,
    //     );
    //     const chainPayload = {
    //         incidentId,
    //         wallet: wallet ?? null,
    //         ts: Math.floor(now.getTime() / 1000),
    //         contentHashHex,
    //         severity: result.severity,
    //         category: result.category,
    //         policyVersion,
    //     };
    //
    //     const doChain = (async () => {
    //         try {
    //             const txId = await submitIncidentToChain(chainPayload);
    //             await supabase.from("incidents").update({
    //                 tx_id: txId,
    //                 chain_status: "submitted",
    //             }).eq("id", incidentId);
    //         } catch (e: any) {
    //             await supabase.from("incidents").update({
    //                 chain_status: "failed",
    //                 last_error: String(e),
    //             }).eq("id", incidentId);
    //         }
    //     })();
    //
    //     if (waitUntil) waitUntil(doChain);
    // }
};
