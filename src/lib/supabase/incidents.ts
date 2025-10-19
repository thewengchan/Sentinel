/**
 * Incidents Storage Utilities
 * Functions for managing moderation incidents in Supabase
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "$lib/supabase/client";

type SupabaseClientType = SupabaseClient<Database>;
type IncidentRow = Tables<"incidents">;

export interface IncidentData {
    session_id: string;
    message_id: string;
    from_side: "user" | "ai";
    wallet_address?: string;
    content: string;
    severity: number;
    category: string;
    policy_version: string;
    action: "allow" | "block" | "truncated";
}

export interface IncidentResult {
    id: string;
    chain_status: "pending" | "submitted" | "confirmed" | "failed";
    tx_id?: string;
}

/**
 * Create a new incident record
 */
export async function createIncident(
    supabase: SupabaseClientType,
    data: IncidentData,
): Promise<IncidentResult> {
    // Compute SHA-256 hash of content
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data.content);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);

    // Convert hash to hex string with '\\x' prefix for PostgreSQL bytea
    const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    const contentHashBytea = `\\x${hashHex}`;

    const { data: incident, error } = await supabase
        .from("incidents")
        .insert({
            session_id: data.session_id,
            message_id: data.message_id,
            from_side: data.from_side,
            wallet_address: data.wallet_address,
            content_hash: contentHashBytea,
            severity: data.severity,
            category: data.category,
            policy_version: data.policy_version,
            action: data.action,
            chain_status: "pending",
        })
        .select("id, chain_status, tx_id")
        .single();

    if (error) {
        // Check if it's a duplicate key error (idempotency)
        if (error.code === "23505" || error.message.includes("duplicate key")) {
            // Fetch existing incident
            const { data: existing, error: fetchError } = await supabase
                .from("incidents")
                .select("id, chain_status, tx_id")
                .eq("session_id", data.session_id)
                .eq("message_id", data.message_id)
                .single();

            if (fetchError) {
                throw new Error(
                    `Failed to fetch existing incident: ${fetchError.message}`,
                );
            }

            console.log(
                `   ℹ️  Duplicate incident detected, returning existing: ${
                    existing.id.slice(0, 8)
                }...`,
            );

            return {
                id: existing.id,
                chain_status: existing.chain_status as
                    | "pending"
                    | "submitted"
                    | "confirmed"
                    | "failed",
                tx_id: existing.tx_id || undefined,
            };
        }

        throw new Error(`Failed to create incident: ${error.message}`);
    }

    console.log(
        `   ✅ Incident created: ${
            incident.id.slice(0, 8)
        }... | severity:${data.severity} | category:${data.category}`,
    );

    return {
        id: incident.id,
        chain_status: incident.chain_status as
            | "pending"
            | "submitted"
            | "confirmed"
            | "failed",
        tx_id: incident.tx_id || undefined,
    };
}

/**
 * Update incident status and transaction ID
 */
export async function updateIncidentStatus(
    supabase: SupabaseClientType,
    incidentId: string,
    status: "pending" | "submitted" | "confirmed" | "failed",
    txId?: string,
): Promise<void> {
    const updateData: Partial<IncidentRow> = { chain_status: status };
    if (txId) {
        updateData.tx_id = txId;
    }

    const { error } = await supabase
        .from("incidents")
        .update(updateData)
        .eq("id", incidentId);

    if (error) {
        throw new Error(`Failed to update incident status: ${error.message}`);
    }

    const txInfo = txId ? ` | tx:${txId.slice(0, 8)}...` : "";
    console.log(
        `   📝 Incident ${
            incidentId.slice(0, 8)
        }... status updated: ${status}${txInfo}`,
    );
}

/**
 * Get incidents for a specific session
 */
export async function getSessionIncidents(
    supabase: SupabaseClientType,
    sessionId: string,
): Promise<IncidentRow[]> {
    const { data: incidents, error } = await supabase
        .from("incidents")
        .select("*")
        .eq("session_id", sessionId)
        .order("ts", { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch session incidents: ${error.message}`);
    }

    return incidents || [];
}

/**
 * Get pending incidents for blockchain submission
 */
export async function getPendingIncidents(
    supabase: SupabaseClientType,
    minSeverity: number = 2,
): Promise<IncidentRow[]> {
    const { data: incidents, error } = await supabase
        .from("incidents")
        .select("*")
        .eq("chain_status", "pending")
        .gte("severity", minSeverity)
        .order("ts", { ascending: true });

    if (error) {
        throw new Error(`Failed to fetch pending incidents: ${error.message}`);
    }

    return incidents || [];
}

/**
 * Get incident by ID
 */
export async function getIncident(
    supabase: SupabaseClientType,
    incidentId: string,
): Promise<IncidentRow> {
    const { data: incident, error } = await supabase
        .from("incidents")
        .select("*")
        .eq("id", incidentId)
        .single();

    if (error) {
        throw new Error(`Failed to fetch incident: ${error.message}`);
    }

    return incident;
}
