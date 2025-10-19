import { redirect, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
    const {
        url,
        locals: { supabase },
    } = event;
    const code = url.searchParams.get("code") as string;
    const next = url.searchParams.get("next") ?? "/";

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            // Remove leading slash if present to avoid double slashes
            const redirectPath = next.startsWith("/") ? next : `/${next}`;
            throw redirect(303, redirectPath);
        }
    }

    // return the user to an error page with instructions
    throw redirect(303, "/auth/auth-code-error");
};
