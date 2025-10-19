/**
 * Chat Messages API
 * Handles creating chat messages
 */

import { json, type RequestHandler } from "@sveltejs/kit";
import { getSupabaseClient, handleSupabaseError } from "$lib/supabase/client";

interface CreateMessageRequest {
    session_id: string;
    role: "user" | "assistant" | "system";
    content: string;
    message_id?: string;
}

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        // Check if user is authenticated
        if (!locals.user) {
            return json({
                success: false,
                error: "Authentication required",
            }, { status: 401 });
        }

        const { session_id, role, content, message_id }: CreateMessageRequest =
            await request.json();

        if (!session_id || !role || !content) {
            return json({
                success: false,
                error: "Session ID, role, and content are required",
            }, { status: 400 });
        }

        const supabase = getSupabaseClient(locals);

        // Verify session belongs to user using auth user ID
        const { data: session, error: sessionError } = await supabase
            .from("chat_sessions")
            .select("id")
            .eq("id", session_id)
            .eq("user_id", locals.user.id)
            .single();

        if (sessionError) {
            console.error("Error verifying session:", sessionError);
            return json({
                success: false,
                error: "Session not found or access denied",
            }, { status: 404 });
        }

        // Create message
        const { data: message, error: createError } = await supabase
            .from("chat_messages")
            .insert({
                session_id,
                role,
                content,
                metadata: message_id ? { message_id } : {},
            })
            .select()
            .single();

        if (createError) {
            console.error("Error creating message:", createError);
            return json({
                success: false,
                error: handleSupabaseError(createError),
            }, { status: 500 });
        }

        return json({
            success: true,
            message,
        });
    } catch (error) {
        console.error("Chat messages POST error:", error);
        return json({
            success: false,
            error: error instanceof Error
                ? error.message
                : "Unknown error occurred",
        }, { status: 500 });
    }
};
