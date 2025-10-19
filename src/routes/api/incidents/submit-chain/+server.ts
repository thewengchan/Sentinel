/**
 * Blockchain Submission API
 * Handles submitting incidents to Algorand blockchain
 */

import { json, type RequestHandler } from "@sveltejs/kit";
import { getIncident, updateIncidentStatus } from "$lib/supabase/incidents";
import {
    formatIncidentForChain,
    submitIncidentToChain,
} from "$lib/algorand/incidents";
import { mainnetClient, testnetClient } from "$lib/algorand/client";
import {
    isBlockchainConfigured,
    SMART_CONTRACT_CONFIG,
} from "$lib/algorand/config";

interface SubmitChainRequest {
    incident_id: string;
    wallet_address: string;
}

export const POST: RequestHandler = async (
    { request, locals: { supabase, user } },
) => {
    try {
        // Check if blockchain is configured
        if (!isBlockchainConfigured()) {
            console.error("❌ Blockchain not configured - APP_ID missing");
            return json({
                success: false,
                error:
                    "Blockchain integration not configured. Please set ALGORAND_APP_ID environment variable.",
            }, { status: 503 });
        }

        const { incident_id, wallet_address }: SubmitChainRequest =
            await request.json();

        if (!incident_id || !wallet_address) {
            return json({
                success: false,
                error: "Incident ID and wallet address are required",
            }, { status: 400 });
        }

        console.log(
            `🔗 Blockchain submission request: incident ${
                incident_id.slice(0, 8)
            }...`,
        );

        // Check if user is authenticated
        if (!user) {
            console.error("   ❌ Authentication required");
            return json({
                success: false,
                error: "Authentication required",
            }, { status: 401 });
        }

        // Verify wallet address belongs to authenticated user
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("wallet_address")
            .eq("id", user.id)
            .single();

        if (userError || !userData) {
            console.log(userError);
            console.log(userData);
            console.error("❌ User not found");
            return json({
                success: false,
                error: "User not found",
            }, { status: 404 });
        }

        if (userData.wallet_address !== wallet_address) {
            console.error("   ❌ Wallet address mismatch");
            return json({
                success: false,
                error: "Wallet address mismatch",
            }, { status: 403 });
        }

        console.log(
            `   ✅ User authenticated: ${wallet_address.slice(0, 8)}...`,
        );

        // Fetch incident from database
        const incident = await getIncident(supabase, incident_id);
        console.log(
            `   📋 Fetched incident: ${incident.category} (severity: ${incident.severity})`,
        );

        // Verify incident belongs to user
        if (incident.wallet_address !== wallet_address) {
            console.error("   ❌ Incident access denied - wallet mismatch");
            return json({
                success: false,
                error: "Incident access denied",
            }, { status: 403 });
        }

        // Check if incident is already submitted
        if (incident.chain_status !== "pending") {
            console.warn(
                `   ⚠️  Incident already ${incident.chain_status} - skipping`,
            );
            return json({
                success: false,
                error: "Incident already submitted to blockchain",
            }, { status: 400 });
        }

        // Convert content hash from bytea to hex string
        // Handle multiple possible formats from Supabase
        let contentHashHex: string;
        const hash = incident.content_hash as unknown;

        if (typeof hash === "string") {
            // If it's already a hex string (starts with \x), remove the prefix
            contentHashHex = hash.startsWith("\\x") ? hash.slice(2) : hash;
        } else if (hash && typeof hash === "object" && "toString" in hash) {
            // Handle Buffer or Buffer-like object
            contentHashHex = (hash as Buffer).toString("hex");
        } else if (
            hash &&
            typeof hash === "object" &&
            "length" in hash &&
            typeof (hash as { length: number }).length === "number"
        ) {
            // Handle Uint8Array or array-like
            contentHashHex = Array.from(hash as ArrayLike<number>)
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");
        } else {
            throw new Error(
                `Invalid content_hash format: ${typeof hash}`,
            );
        }

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
        console.log(
            `   🌐 Using ${SMART_CONTRACT_CONFIG.NETWORK} network (APP_ID: ${SMART_CONTRACT_CONFIG.APP_ID})`,
        );

        // Submit incident to blockchain using smart contract ABI method call
        console.log(`   📤 Submitting to blockchain...`);
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

            console.log(
                `   ✅ Blockchain submission successful: ${result.txId}`,
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

            console.error(
                `   ❌ Blockchain submission failed: ${result.error}`,
            );

            return json({
                success: false,
                error: result.error ||
                    "Failed to submit incident to blockchain",
                chain_status: "failed",
            }, { status: 500 });
        }
    } catch (error) {
        console.error(
            "   ❌ Blockchain submission error:",
            error instanceof Error ? error.message : error,
        );

        // Try to update incident status to 'failed' if we have the incident_id
        try {
            const { incident_id } = await request.json();
            if (incident_id) {
                await updateIncidentStatus(supabase, incident_id, "failed");
            }
        } catch {
            // Silent fail on update error
        }

        return json({
            success: false,
            error: error instanceof Error
                ? error.message
                : "Unknown error occurred",
        }, { status: 500 });
    }
};
