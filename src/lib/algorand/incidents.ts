/**
 * Algorand Incidents - Blockchain submission for moderation incidents
 * Implements incident logging to Algorand blockchain
 */

import { AlgorandClient } from "$lib/algorand/client";
import { SMART_CONTRACT_CONFIG } from "$lib/algorand/config";

export interface ChainIncident {
    incidentId: string;
    wallet?: string | null;
    ts: number;
    contentHashHex: string; // SHA-256 hash as hex string
    severity: number;
    category: string;
    policyVersion: string;
    action: string;
}

export interface IncidentSubmissionResult {
    txId: string;
    success: boolean;
    error?: string;
}

/**
 * Submit incident to Algorand blockchain using smart contract ABI method call
 */
export async function submitIncidentToChain(
    incident: ChainIncident,
    client: AlgorandClient,
    senderAddress: string,
): Promise<IncidentSubmissionResult> {
    try {
        if (
            !SMART_CONTRACT_CONFIG.APP_ID ||
            Number(SMART_CONTRACT_CONFIG.APP_ID) === 0
        ) {
            throw new Error("Smart contract APP_ID not configured");
        }

        // Convert content hash from hex string to Uint8Array
        const contentHashBytes = new Uint8Array(
            incident.contentHashHex.match(/.{1,2}/g)?.map((byte) =>
                parseInt(byte, 16)
            ) || [],
        );

        // Call the smart contract method
        const result = await client.submitIncidentToContract({
            sender: senderAddress,
            appId: Number(SMART_CONTRACT_CONFIG.APP_ID),
            incidentId: incident.incidentId,
            walletAddress: incident.wallet || "",
            contentHash: contentHashBytes,
            severity: incident.severity,
            category: incident.category,
            policyVersion: incident.policyVersion,
            actionTaken: incident.action,
        });

        return {
            txId: result.txId,
            success: result.success,
            error: result.error,
        };
    } catch (error) {
        console.error("Failed to submit incident to blockchain:", error);
        return {
            txId: "",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Convert incident data from database format to chain format
 */
export function formatIncidentForChain(
    incident: {
        id: string;
        wallet_address: string;
        ts: string;
        severity: number;
        category: string;
        policy_version: string;
        action: string;
    },
    contentHashHex: string,
): ChainIncident {
    return {
        incidentId: incident.id,
        wallet: incident.wallet_address,
        ts: new Date(incident.ts).getTime(),
        contentHashHex,
        severity: incident.severity,
        category: incident.category,
        policyVersion: incident.policy_version,
        action: incident.action,
    };
}
