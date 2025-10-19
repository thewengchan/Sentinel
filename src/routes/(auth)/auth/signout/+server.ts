import { json, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals: { supabase } }) => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        return json({ error: error.message }, { status: 500 });
    }
    // Redirect to login page after successful sign out
    redirect(303, "/auth/login");
};
