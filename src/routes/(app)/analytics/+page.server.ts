import type { PageServerLoad } from "./$types";
import { getAnalyticsData } from "$lib/supabase/queries";
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

    // Get time range from URL (default 30 days)
    const days = parseInt(url.searchParams.get("days") || "30", 10);

    try {
        // Fetch analytics data
        const analyticsData = await getAnalyticsData(locals.supabase, days);

        return {
            ...analyticsData,
            timeRange: days,
        };
    } catch (err) {
        console.error("Error loading analytics data:", err);
        // Return empty data instead of throwing to allow page to render
        return {
            safetyScore: 100,
            avgResponseTime: 0,
            dailyActiveUsers: 0,
            flaggedRate: 0,
            categoryBreakdown: [],
            userActivity: [],
            trends: [],
            timeRange: days,
            error: err instanceof Error
                ? err.message
                : "Failed to load analytics data",
        };
    }
};
