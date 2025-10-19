/**
 * Blockchain Submission API
 * Handles submitting incidents to Algorand blockchain
 */

import { json, type RequestHandler } from "@sveltejs/kit";
import { getSupabaseClient } from "$lib/supabase/client";
import { getIncident, updateIncidentStatus } from "$lib/supabase/incidents";
import {
    formatIncidentForChain,
    submitIncidentToChain,
} from "$lib/algorand/incidents";
import { mainnetClient, testnetClient } from "$lib/algorand/client";
import { SMART_CONTRACT_CONFIG } from "$lib/algorand/config";

interface SubmitChainRequest {
    incident_id: string;
    wallet_address: string;
}

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const { incident_id, wallet_address }: SubmitChainRequest =
            await request.json();

        if (!incident_id || !wallet_address) {
            return json({
                success: false,
                error: "Incident ID and wallet address are required",
            }, { status: 400 });
        }

        const supabase = getSupabaseClient(locals);

        // Check if user is authenticated
        if (!locals.user) {
            return json({
                success: false,
                error: "Authentication required",
            }, { status: 401 });
        }

        // Verify wallet address belongs to authenticated user
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("wallet_address")
            .eq("auth_user_id", locals.user.id)
            .single();

        if (userError || !user) {
            return json({
                success: false,
                error: "User not found",
            }, { status: 404 });
        }

        if (user.wallet_address !== wallet_address) {
            return json({
                success: false,
                error: "Wallet address mismatch",
            }, { status: 403 });
        }

        // Fetch incident from database
        const incident = await getIncident(supabase, incident_id);

        // Verify incident belongs to user
        if (incident.wallet_address !== wallet_address) {
            return json({
                success: false,
                error: "Incident access denied",
            }, { status: 403 });
        }

        // Check if incident is already submitted
        if (incident.chain_status !== "pending") {
            return json({
                success: false,
                error: "Incident already submitted to blockchain",
            }, { status: 400 });
        }

        // Convert content hash from bytea to hex string
        const contentHashHex = Buffer.from(incident.content_hash).toString(
            "hex",
        );

        // Format incident for blockchain submission
        const chainIncident = formatIncidentForChain({
            id: incident.id,
            wallet_address: incident.wallet_address || "",
            ts: incident.ts,
            severity: incident.severity,
            category: incident.category,
            policy_version: incident.policy_version,
            action: incident.action,
        }, contentHashHex);

        // Get the appropriate client based on network configuration
        const client = SMART_CONTRACT_CONFIG.NETWORK === "mainnet"
            ? mainnetClient
            : testnetClient;

        // Submit incident to blockchain using smart contract ABI method call
        const result = await submitIncidentToChain(
            chainIncident,
            client,
            wallet_address,
        );

        if (result.success) {
            // Update incident status to submitted with real transaction ID
            await updateIncidentStatus(
                supabase,
                incident_id,
                "submitted",
                result.txId,
            );

            return json({
                success: true,
                tx_id: result.txId,
                chain_status: "submitted",
            });
        } else {
            // Update incident status to failed with error message
            await updateIncidentStatus(
                supabase,
                incident_id,
                "failed",
            );

            return json({
                success: false,
                error: result.error ||
                    "Failed to submit incident to blockchain",
                chain_status: "failed",
            }, { status: 500 });
        }
    } catch (error) {
        console.error("Blockchain submission error:", error);

        // Try to update incident status to 'failed' if we have the incident_id
        try {
            const { incident_id } = await request.json();
            if (incident_id) {
                const supabase = getSupabaseClient(locals);
                await updateIncidentStatus(supabase, incident_id, "failed");
            }
        } catch (updateError) {
            console.error(
                "Failed to update incident status to failed:",
                updateError,
            );
        }

        return json({
            success: false,
            error: error instanceof Error
                ? error.message
                : "Unknown error occurred",
        }, { status: 500 });
    }
};
