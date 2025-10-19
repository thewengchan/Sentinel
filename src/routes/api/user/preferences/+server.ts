/**
 * User Preferences API
 * Handles loading and saving user preferences to Supabase
 */

import { json, type RequestHandler } from "@sveltejs/kit";
import { getSupabaseClient, handleSupabaseError } from "$lib/supabase/client";

export const GET: RequestHandler = async ({ locals }) => {
    try {
        // Check if user is authenticated
        if (!locals.user) {
            return json({
                success: false,
                error: "Authentication required",
            }, { status: 401 });
        }

        const supabase = getSupabaseClient(locals);

        // Fetch user preferences using auth user ID
        const { data: preferences, error: fetchError } = await supabase
            .from("user_preferences")
            .select("preferences")
            .eq("user_id", locals.user.id)
            .single();

        if (fetchError && fetchError.code !== "PGRST116") { // PGRST116 = no rows returned
            console.error("Error fetching preferences:", fetchError);
            return json({
                success: false,
                error: handleSupabaseError(fetchError),
            }, { status: 500 });
        }

        return json({
            success: true,
            preferences: preferences?.preferences || null,
        });
    } catch (error) {
        console.error("User preferences GET error:", error);
        return json({
            success: false,
            error: error instanceof Error
                ? error.message
                : "Unknown error occurred",
        }, { status: 500 });
    }
};

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        // Check if user is authenticated
        if (!locals.user) {
            return json({
                success: false,
                error: "Authentication required",
            }, { status: 401 });
        }

        const { preferences } = await request.json();

        if (!preferences) {
            return json({
                success: false,
                error: "Preferences data is required",
            }, { status: 400 });
        }

        const supabase = getSupabaseClient(locals);

        // Get user record to get wallet_address
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("wallet_address")
            .eq("auth_user_id", locals.user.id)
            .single();

        if (userError) {
            console.error("Error fetching user:", userError);
            return json({
                success: false,
                error: handleSupabaseError(userError),
            }, { status: 500 });
        }

        // Upsert user preferences
        const { error: upsertError } = await supabase
            .from("user_preferences")
            .upsert({
                user_id: locals.user.id,
                wallet_address: user.wallet_address,
                preferences: preferences,
            });

        if (upsertError) {
            console.error("Error upserting preferences:", upsertError);
            return json({
                success: false,
                error: handleSupabaseError(upsertError),
            }, { status: 500 });
        }

        return json({
            success: true,
        });
    } catch (error) {
        console.error("User preferences POST error:", error);
        return json({
            success: false,
            error: error instanceof Error
                ? error.message
                : "Unknown error occurred",
        }, { status: 500 });
    }
};
