import type { PageServerLoad } from "./$types";
import { getMessageLogs } from "$lib/supabase/queries";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals, url }) => {
    if (!locals.supabase) {
        throw error(500, "Supabase client not available");
    }

    // Check if user is authenticated
    const {
        data: { session },
    } = await locals.supabase.auth.getSession();

    if (!session) {
        throw error(401, "Authentication required");
    }

    // Get pagination params from URL
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20", 10);

    try {
        // Fetch message logs with pagination
        const logsData = await getMessageLogs(locals.supabase, page, pageSize);

        return {
            logs: logsData.logs,
            totalCount: logsData.totalCount,
            safeCount: logsData.safeCount,
            flaggedCount: logsData.flaggedCount,
            blockedCount: logsData.blockedCount,
            currentPage: page,
            pageSize,
            totalPages: Math.ceil(logsData.totalCount / pageSize),
        };
    } catch (err) {
        console.error("Error loading message logs:", err);
        // Return empty data instead of throwing to allow page to render
        return {
            logs: [],
            totalCount: 0,
            safeCount: 0,
            flaggedCount: 0,
            blockedCount: 0,
            currentPage: 1,
            pageSize: 20,
            totalPages: 0,
            error: err instanceof Error
                ? err.message
                : "Failed to load message logs",
        };
    }
};
