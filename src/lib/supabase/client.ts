/**
 * Supabase Client Utilities
 * Helper functions for working with Supabase in the Sentinel dApp
 */

import type { Database } from "../../../database.types.js";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Get typed Supabase client from server locals
 * This is used in API routes where we have access to event.locals.supabase
 */
export function getSupabaseClient(
    locals: App.Locals,
): SupabaseClient<Database> {
    if (!locals.supabase) {
        throw new Error("Supabase client not available in locals");
    }
    return locals.supabase;
}

/**
 * Common error handling for Supabase operations
 */
export function handleSupabaseError(error: unknown): string {
    if (error && typeof error === "object") {
        const err = error as Record<string, unknown>;
        if (err.code === "PGRST301") {
            return "No data found";
        }
        if (err.code === "23505") {
            return "This item already exists";
        }
        if (err.code === "23503") {
            return "Referenced item not found";
        }
        if (typeof err.message === "string") {
            if (err.message.includes("JWT")) {
                return "Authentication required";
            }
            if (err.message.includes("RLS")) {
                return "Access denied";
            }
            if (
                err.message.includes("network") || err.message.includes("fetch")
            ) {
                return "Network error - please check your connection";
            }
            return err.message;
        }
    }
    return "An unexpected error occurred";
}

/**
 * Check if error is a network/connectivity issue
 */
export function isNetworkError(error: unknown): boolean {
    if (error && typeof error === "object") {
        const err = error as Record<string, unknown>;
        if (typeof err.message === "string") {
            return (
                err.message.includes("network") ||
                err.message.includes("fetch") ||
                err.message.includes("timeout")
            );
        }
        return err.code === "NETWORK_ERROR";
    }
    return false;
}

/**
 * Determine if an operation should be retried
 */
export function shouldRetry(error: unknown): boolean {
    if (error && typeof error === "object") {
        const err = error as Record<string, unknown>;
        return isNetworkError(error) || err.code === "PGRST301";
    }
    return false;
}

/**
 * Type-safe helper to extract data from Supabase response
 */
export function extractData<T>(
    response: { data: T | null; error: unknown },
): T {
    if (response.error) {
        throw new Error(handleSupabaseError(response.error));
    }
    if (response.data === null) {
        throw new Error("No data returned");
    }
    return response.data;
}

/**
 * Type-safe helper to extract single item from Supabase response
 */
export function extractSingle<T>(
    response: { data: T | null; error: unknown },
): T {
    if (response.error) {
        throw new Error(handleSupabaseError(response.error));
    }
    if (response.data === null) {
        throw new Error("Item not found");
    }
    return response.data;
}

// Export types for convenience
export type { Database } from "../../../database.types.js";
export type Tables<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Update"];
