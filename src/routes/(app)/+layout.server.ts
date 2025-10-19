import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (
    { locals: { safeGetSession }, url },
) => {
    const { session } = await safeGetSession();

    // If user is not authenticated, redirect to login
    if (!session) {
        throw redirect(
            303,
            `/auth/login?redirectTo=${encodeURIComponent(url.pathname)}`,
        );
    }

    return {
        session,
    };
};
