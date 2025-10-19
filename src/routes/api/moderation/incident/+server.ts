/**
 * Moderation Incident API
 * Handles storing moderation incidents
 */

import { json, type RequestHandler } from "@sveltejs/kit";
import { getSupabaseClient } from "$lib/supabase/client";
import { createIncident } from "$lib/supabase/incidents";

interface IncidentRequest {
    session_id: string;
    message_id: string;
    from_side: "user" | "ai";
    severity: number;
    category: string;
    content: string;
    action: "allow" | "block" | "truncated";
    policy_version: string;
}

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const {
            session_id,
            message_id,
            from_side,
            severity,
            category,
            content,
            action,
            policy_version,
        }: IncidentRequest = await request.json();

        // Validate required fields
        if (
            !session_id || !message_id || !from_side ||
            severity === undefined || !category || !content || !action ||
            !policy_version
        ) {
            return json({
                success: false,
                error: "All fields are required",
            }, { status: 400 });
        }

        const supabase = getSupabaseClient(locals);

        // Get current wallet address from context
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: walletData, error: contextError } =
            await (supabase.rpc as any)(
                "get_current_wallet_address",
            );

        if (contextError || !walletData) {
            return json({
                success: false,
                error: "Wallet context not set",
            }, { status: 401 });
        }

        // Extract wallet address string (handle both string and object responses)
        const walletAddress = typeof walletData === "string"
            ? walletData
            : (walletData as { wallet_address?: string })?.wallet_address;

        if (!walletAddress) {
            return json({
                success: false,
                error: "Wallet address not found",
            }, { status: 401 });
        }

        // Verify session belongs to user
        const { error: sessionError } = await supabase
            .from("chat_sessions")
            .select("id")
            .eq("id", session_id)
            .eq("wallet_address", walletAddress)
            .single();

        if (sessionError) {
            console.error("Error verifying session:", sessionError);
            return json({
                success: false,
                error: "Session not found or access denied",
            }, { status: 404 });
        }

        // Create incident
        const incidentData = {
            session_id,
            message_id,
            from_side,
            wallet_address: walletAddress,
            content,
            severity,
            category,
            policy_version,
            action,
        };

        const result = await createIncident(supabase, incidentData);

        // If severity >= 2, trigger blockchain submission (fire-and-forget)
        if (severity >= 1) {
            // Don't await this - let it run in background
            fetch("/api/incidents/submit-chain", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    incident_id: result.id,
                    wallet_address: walletAddress,
                }),
            }).catch((error) => {
                console.error(
                    "Failed to trigger blockchain submission:",
                    error,
                );
            });
        }

        return json({
            success: true,
            incident_id: result.id,
            chain_status: result.chain_status,
        });
    } catch (error) {
        console.error("Moderation incident POST error:", error);
        return json({
            success: false,
            error: error instanceof Error
                ? error.message
                : "Unknown error occurred",
        }, { status: 500 });
    }
};
