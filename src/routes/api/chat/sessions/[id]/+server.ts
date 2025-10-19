/**
 * Individual Chat Session API
 * Handles operations for a specific chat session
 */

import { json, type RequestHandler } from "@sveltejs/kit";
import { getSupabaseClient, handleSupabaseError } from "$lib/supabase/client";

interface UpdateSessionRequest {
    title?: string;
}

export const GET: RequestHandler = async ({ params, locals }) => {
    try {
        const sessionId = params.id;
        if (!sessionId) {
            return json({
                success: false,
                error: "Session ID is required",
            }, { status: 400 });
        }

        const supabase = getSupabaseClient(locals);

        // Get current wallet address from context
        const { data: walletAddress, error: contextError } = await supabase.rpc(
            "get_current_wallet_address",
        );

        if (contextError || !walletAddress) {
            return json({
                success: false,
                error: "Wallet context not set",
            }, { status: 401 });
        }

        // Fetch session
        const { data: session, error: sessionError } = await supabase
            .from("chat_sessions")
            .select("*")
            .eq("id", sessionId)
            .eq("wallet_address", walletAddress)
            .single();

        if (sessionError) {
            console.error("Error fetching session:", sessionError);
            return json({
                success: false,
                error: handleSupabaseError(sessionError),
            }, { status: 500 });
        }

        // Fetch messages for this session
        const { data: messages, error: messagesError } = await supabase
            .from("chat_messages")
            .select("*")
            .eq("session_id", sessionId)
            .order("created_at", { ascending: true });

        if (messagesError) {
            console.error("Error fetching messages:", messagesError);
            return json({
                success: false,
                error: handleSupabaseError(messagesError),
            }, { status: 500 });
        }

        return json({
            success: true,
            session,
            messages: messages || [],
        });
    } catch (error) {
        console.error("Chat session GET error:", error);
        return json({
            success: false,
            error: error instanceof Error
                ? error.message
                : "Unknown error occurred",
        }, { status: 500 });
    }
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
    try {
        const sessionId = params.id;
        if (!sessionId) {
            return json({
                success: false,
                error: "Session ID is required",
            }, { status: 400 });
        }

        const { title }: UpdateSessionRequest = await request.json();

        if (!title) {
            return json({
                success: false,
                error: "Title is required",
            }, { status: 400 });
        }

        const supabase = getSupabaseClient(locals);

        // Get current wallet address from context
        const { data: walletAddress, error: contextError } = await supabase.rpc(
            "get_current_wallet_address",
        );

        if (contextError || !walletAddress) {
            return json({
                success: false,
                error: "Wallet context not set",
            }, { status: 401 });
        }

        // Update session
        const { data: session, error: updateError } = await supabase
            .from("chat_sessions")
            .update({ title })
            .eq("id", sessionId)
            .eq("wallet_address", walletAddress)
            .select()
            .single();

        if (updateError) {
            console.error("Error updating session:", updateError);
            return json({
                success: false,
                error: handleSupabaseError(updateError),
            }, { status: 500 });
        }

        return json({
            success: true,
            session,
        });
    } catch (error) {
        console.error("Chat session PATCH error:", error);
        return json({
            success: false,
            error: error instanceof Error
                ? error.message
                : "Unknown error occurred",
        }, { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
    try {
        const sessionId = params.id;
        if (!sessionId) {
            return json({
                success: false,
                error: "Session ID is required",
            }, { status: 400 });
        }

        const supabase = getSupabaseClient(locals);

        // Get current wallet address from context
        const { data: walletAddress, error: contextError } = await supabase.rpc(
            "get_current_wallet_address",
        );

        if (contextError || !walletAddress) {
            return json({
                success: false,
                error: "Wallet context not set",
            }, { status: 401 });
        }

        // Delete session (CASCADE will handle messages)
        const { error: deleteError } = await supabase
            .from("chat_sessions")
            .delete()
            .eq("id", sessionId)
            .eq("wallet_address", walletAddress);

        if (deleteError) {
            console.error("Error deleting session:", deleteError);
            return json({
                success: false,
                error: handleSupabaseError(deleteError),
            }, { status: 500 });
        }

        return json({
            success: true,
        });
    } catch (error) {
        console.error("Chat session DELETE error:", error);
        return json({
            success: false,
            error: error instanceof Error
                ? error.message
                : "Unknown error occurred",
        }, { status: 500 });
    }
};
