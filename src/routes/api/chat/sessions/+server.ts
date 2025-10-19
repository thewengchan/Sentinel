/**
 * Chat Sessions API
 * Handles CRUD operations for chat sessions
 */

import { json, type RequestHandler } from "@sveltejs/kit";
import { getSupabaseClient, handleSupabaseError } from "$lib/supabase/client";

interface CreateSessionRequest {
    title: string;
}

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

        // Fetch chat sessions using auth user ID
        const { data: sessions, error: fetchError } = await supabase
            .from("chat_sessions")
            .select("*")
            .eq("user_id", locals.user.id)
            .order("updated_at", { ascending: false });

        if (fetchError) {
            console.error("Error fetching sessions:", fetchError);
            return json({
                success: false,
                error: handleSupabaseError(fetchError),
            }, { status: 500 });
        }

        return json({
            success: true,
            sessions: sessions || [],
        });
    } catch (error) {
        console.error("Chat sessions GET error:", error);
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

        const { title }: CreateSessionRequest = await request.json();

        if (!title) {
            return json({
                success: false,
                error: "Session title is required",
            }, { status: 400 });
        }

        const supabase = getSupabaseClient(locals);

        // Get user record to get wallet_address
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("wallet_address")
            .eq("id", locals.user.id)
            .single();

        if (userError) {
            console.error("Error fetching user:", userError);
            return json({
                success: false,
                error: handleSupabaseError(userError),
            }, { status: 500 });
        }

        // Create new session
        const { data: session, error: createError } = await supabase
            .from("chat_sessions")
            .insert({
                user_id: locals.user.id,
                wallet_address: user.wallet_address || "",
                title,
                message_count: 0,
            })
            .select()
            .single();

        if (createError) {
            console.error("Error creating session:", createError);
            return json({
                success: false,
                error: handleSupabaseError(createError),
            }, { status: 500 });
        }

        return json({
            success: true,
            session,
        });
    } catch (error) {
        console.error("Chat sessions POST error:", error);
        return json({
            success: false,
            error: error instanceof Error
                ? error.message
                : "Unknown error occurred",
        }, { status: 500 });
    }
};
