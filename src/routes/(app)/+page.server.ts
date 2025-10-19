import type { PageServerLoad } from "./$types";
import { getDashboardStats, getRecentActivity } from "$lib/supabase/queries";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals }) => {
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

    try {
        // Fetch dashboard data
        const [stats, recentActivity] = await Promise.all([
            getDashboardStats(locals.supabase),
            getRecentActivity(locals.supabase, 5),
        ]);

        return {
            stats,
            recentActivity,
        };
    } catch (err) {
        console.error("Error loading dashboard data:", err);
        // Return empty data instead of throwing to allow page to render
        return {
            stats: {
                totalMessages: 0,
                safeMessages: 0,
                flaggedMessages: 0,
                blockedMessages: 0,
                activeUsers: 0,
                safetyRate: 100,
                blockchainStats: {
                    totalLogs: 0,
                    lastTransaction: null,
                    pendingTransactions: 0,
                    confirmedTransactions: 0,
                },
            },
            recentActivity: [],
            error: err instanceof Error
                ? err.message
                : "Failed to load dashboard data",
        };
    }
};
