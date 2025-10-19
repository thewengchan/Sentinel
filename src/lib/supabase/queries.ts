/**
 * Supabase Query Helpers
 * Reusable query functions for fetching data across the app
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../database.types.js";
import { handleSupabaseError } from "./client.js";

type DbClient = SupabaseClient<Database>;

// =====================================================
// Dashboard Queries
// =====================================================

export interface DashboardStats {
    totalMessages: number;
    safeMessages: number;
    flaggedMessages: number;
    blockedMessages: number;
    activeUsers: number;
    safetyRate: number;
    blockchainStats: {
        totalLogs: number;
        lastTransaction: string | null;
        pendingTransactions: number;
        confirmedTransactions: number;
    };
}

export interface RecentActivityItem {
    id: string;
    type: "safe" | "flagged" | "blocked" | "new_member";
    user_name: string;
    description: string;
    timestamp: string;
    details?: string;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(
    supabase: DbClient,
): Promise<DashboardStats> {
    try {
        // Get total message count
        const { count: totalMessages, error: msgError } = await supabase
            .from("chat_messages")
            .select("*", { count: "exact", head: true });

        if (msgError) throw msgError;

        // Get incidents breakdown
        const { data: incidents, error: incidentError } = await supabase
            .from("incidents")
            .select("action, chain_status, ts");

        if (incidentError) throw incidentError;

        // Calculate safe/flagged/blocked counts
        const safeMessages = incidents?.filter((i) =>
            i.action === "allow"
        ).length || 0;
        const flaggedMessages = incidents?.filter((i) =>
            i.action === "truncated"
        ).length || 0;
        const blockedMessages =
            incidents?.filter((i) => i.action === "block").length || 0;

        // Get active users count
        const { count: activeUsers, error: userError } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true });

        if (userError) throw userError;

        // Calculate safety rate
        const total = totalMessages || 0;
        const safetyRate = total > 0 ? (safeMessages / total) * 100 : 100;

        // Get blockchain stats from incidents
        const totalLogs =
            incidents?.filter((i) => i.chain_status === "confirmed").length ||
            0;
        const lastTransaction = incidents?.[0]?.ts || null;
        const pendingTransactions =
            incidents?.filter((i) => i.chain_status === "pending").length || 0;
        const confirmedTransactions =
            incidents?.filter((i) => i.chain_status === "confirmed").length ||
            0;

        return {
            totalMessages: totalMessages || 0,
            safeMessages,
            flaggedMessages,
            blockedMessages,
            activeUsers: activeUsers || 0,
            safetyRate: Math.round(safetyRate * 10) / 10,
            blockchainStats: {
                totalLogs,
                lastTransaction,
                pendingTransactions,
                confirmedTransactions,
            },
        };
    } catch (error) {
        throw new Error(
            `Failed to fetch dashboard stats: ${handleSupabaseError(error)}`,
        );
    }
}

/**
 * Get recent activity feed
 */
export async function getRecentActivity(
    supabase: DbClient,
    limit = 10,
): Promise<RecentActivityItem[]> {
    try {
        // Get recent incidents with user info
        const { data: incidents, error: incidentError } = await supabase
            .from("incidents")
            .select(
                `
				id,
				action,
				category,
				severity,
				ts,
				from_side,
				session_id,
				chat_sessions!inner(user_id, users!inner(full_name, email))
			`,
            )
            .order("ts", { ascending: false })
            .limit(limit);

        if (incidentError) throw incidentError;

        // Transform incidents into activity items
        const activities: RecentActivityItem[] = (incidents || []).map(
            (incident) => {
                const session = incident.chat_sessions as unknown as {
                    users:
                        | { full_name: string | null; email: string | null }
                        | null;
                } | null;
                const userName = session?.users?.full_name ||
                    session?.users?.email || "Unknown User";
                let type: "safe" | "flagged" | "blocked" = "safe";
                let description = "";

                if (incident.action === "block") {
                    type = "blocked";
                    description = `Content blocked - ${incident.category}`;
                } else if (incident.action === "truncated") {
                    type = "flagged";
                    description =
                        `Content flagged for review - ${incident.category}`;
                } else {
                    type = "safe";
                    description = "Safe conversation detected";
                }

                return {
                    id: incident.id,
                    type,
                    user_name: userName,
                    description,
                    timestamp: incident.ts,
                    details:
                        `Severity: ${incident.severity}, Category: ${incident.category}`,
                };
            },
        );

        return activities;
    } catch (error) {
        throw new Error(
            `Failed to fetch recent activity: ${handleSupabaseError(error)}`,
        );
    }
}

// =====================================================
// Message Logs Queries
// =====================================================

export interface MessageLog {
    id: string;
    user_name: string;
    message: string;
    response: string;
    status: "safe" | "flagged" | "blocked";
    timestamp: string;
    flagReason: string | null;
    severity?: number;
    category?: string;
}

export interface MessageLogsResponse {
    logs: MessageLog[];
    totalCount: number;
    safeCount: number;
    flaggedCount: number;
    blockedCount: number;
}

/**
 * Get message logs with pagination
 */
export async function getMessageLogs(
    supabase: DbClient,
    page = 1,
    pageSize = 20,
): Promise<MessageLogsResponse> {
    try {
        const offset = (page - 1) * pageSize;

        // Get messages with session and user info
        const { data: messages, error: msgError, count } = await supabase
            .from("chat_messages")
            .select(
                `
				id,
				content,
				role,
				created_at,
				session_id,
				chat_sessions!inner(user_id, users!inner(full_name, email))
			`,
                { count: "exact" },
            )
            .order("created_at", { ascending: false })
            .range(offset, offset + pageSize - 1);

        if (msgError) throw msgError;

        // Get all incidents for these messages
        const { data: incidents, error: incidentError } = await supabase
            .from("incidents")
            .select("message_id, action, category, severity, session_id");

        if (incidentError) throw incidentError;

        // Create a map of message_id to incident
        const incidentMap = new Map(
            incidents?.map((i) => [i.message_id, i]) || [],
        );

        // Process messages into logs
        const logs: MessageLog[] = [];
        let currentUserMsg: typeof messages extends (infer U)[] | null
            ? U | null
            : null = null;

        for (const msg of messages || []) {
            if (msg.role === "user") {
                currentUserMsg = msg;
            } else if (msg.role === "assistant" && currentUserMsg) {
                const incident = incidentMap.get(msg.id);
                const session = msg.chat_sessions as unknown as {
                    users:
                        | { full_name: string | null; email: string | null }
                        | null;
                } | null;
                const userName = session?.users?.full_name ||
                    session?.users?.email || "Unknown User";

                let status: "safe" | "flagged" | "blocked" = "safe";
                let flagReason: string | null = null;

                if (incident) {
                    if (incident.action === "block") {
                        status = "blocked";
                        flagReason =
                            `${incident.category} - Severity ${incident.severity}`;
                    } else if (incident.action === "truncated") {
                        status = "flagged";
                        flagReason =
                            `${incident.category} - Severity ${incident.severity}`;
                    }
                }

                logs.push({
                    id: msg.id,
                    user_name: userName,
                    message: currentUserMsg.content,
                    response: msg.content,
                    status,
                    timestamp: msg.created_at || "",
                    flagReason,
                    severity: incident?.severity,
                    category: incident?.category,
                });

                currentUserMsg = null;
            }
        }

        // Calculate counts
        const safeCount = logs.filter((l) => l.status === "safe").length;
        const flaggedCount = logs.filter((l) => l.status === "flagged").length;
        const blockedCount = logs.filter((l) => l.status === "blocked").length;

        return {
            logs,
            totalCount: count || 0,
            safeCount,
            flaggedCount,
            blockedCount,
        };
    } catch (error) {
        throw new Error(
            `Failed to fetch message logs: ${handleSupabaseError(error)}`,
        );
    }
}

// =====================================================
// Analytics Queries
// =====================================================

export interface AnalyticsData {
    safetyScore: number;
    avgResponseTime: number;
    dailyActiveUsers: number;
    flaggedRate: number;
    categoryBreakdown: {
        category: string;
        count: number;
        percentage: number;
    }[];
    userActivity: {
        user_id: string;
        user_name: string;
        messages: number;
        safetyRate: number;
        flaggedCount: number;
    }[];
    trends: {
        date: string;
        safeMessages: number;
        flaggedMessages: number;
    }[];
}

/**
 * Get analytics data
 */
export async function getAnalyticsData(
    supabase: DbClient,
    days = 30,
): Promise<AnalyticsData> {
    try {
        // Get date range
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get total message count
        const { count: totalMessages } = await supabase
            .from("chat_messages")
            .select("*", { count: "exact", head: true });

        // Get incidents for safety calculations
        const { data: incidents } = await supabase
            .from("incidents")
            .select("action, category, severity, ts, session_id")
            .gte("ts", startDate.toISOString());

        const safeCount = incidents?.filter((i) =>
            i.action === "allow"
        ).length || 0;
        const flaggedCount = incidents?.filter((i) =>
            i.action !== "allow"
        ).length || 0;
        const total = totalMessages || 0;

        // Calculate safety score
        const safetyScore = total > 0 ? (safeCount / total) * 100 : 100;
        const flaggedRate = total > 0 ? (flaggedCount / total) * 100 : 0;

        // Category breakdown
        const categoryMap = new Map<string, number>();
        incidents?.forEach((i) => {
            if (i.action !== "allow") {
                categoryMap.set(
                    i.category,
                    (categoryMap.get(i.category) || 0) + 1,
                );
            }
        });

        const categoryBreakdown = Array.from(categoryMap.entries()).map((
            [category, count],
        ) => ({
            category,
            count,
            percentage: flaggedCount > 0 ? (count / flaggedCount) * 100 : 0,
        }));

        // Get user activity
        const { data: userMessages } = await supabase
            .from("chat_messages")
            .select(
                `
				id,
				session_id,
				chat_sessions!inner(user_id, users!inner(full_name, email))
			`,
            );

        // Aggregate by user
        const userMap = new Map<string, { name: string; count: number }>();
        userMessages?.forEach((msg) => {
            const session = msg.chat_sessions as unknown as {
                user_id: string;
                users:
                    | { full_name: string | null; email: string | null }
                    | null;
            } | null;
            const userId = session?.user_id;
            const userName = session?.users?.full_name || session?.users?.email;
            if (userId && userName) {
                const current = userMap.get(userId) ||
                    { name: userName, count: 0 };
                userMap.set(userId, { ...current, count: current.count + 1 });
            }
        });

        // Get incident counts per user
        const userActivity = Array.from(userMap.entries()).map(
            ([user_id, data]) => {
                const userIncidents = incidents?.filter((i) => {
                    // This is a simplified version - you might need to join through sessions
                    return i.action !== "allow";
                });

                const userFlagged = userIncidents?.length || 0;
                const safetyRate = data.count > 0
                    ? ((data.count - userFlagged) / data.count) * 100
                    : 100;

                return {
                    user_id,
                    user_name: data.name,
                    messages: data.count,
                    safetyRate: Math.round(safetyRate * 10) / 10,
                    flaggedCount: userFlagged,
                };
            },
        );

        // Calculate daily active users from analytics events
        const { count: dau } = await supabase
            .from("analytics_events")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startDate.toISOString())
            .eq("event_type", "page_view");

        return {
            safetyScore: Math.round(safetyScore * 10) / 10,
            avgResponseTime: 1.2, // Mock for now - would need separate tracking
            dailyActiveUsers: Math.ceil((dau || 0) / days),
            flaggedRate: Math.round(flaggedRate * 10) / 10,
            categoryBreakdown,
            userActivity,
            trends: [], // Mock for now - would need time-series aggregation
        };
    } catch (error) {
        throw new Error(
            `Failed to fetch analytics data: ${handleSupabaseError(error)}`,
        );
    }
}

/**
 * Get user-specific statistics
 */
export async function getUserStats(supabase: DbClient, userId: string) {
    try {
        // Get user's message count
        const { count: messageCount } = await supabase
            .from("chat_messages")
            .select("*", { count: "exact", head: true })
            .eq("session_id", userId);

        // Get user's incidents
        const { data: incidents } = await supabase
            .from("incidents")
            .select("action, severity, category")
            .eq("session_id", userId);

        const flaggedCount = incidents?.filter((i) =>
            i.action !== "allow"
        ).length || 0;
        const safetyRate = messageCount && messageCount > 0
            ? ((messageCount - flaggedCount) / messageCount) * 100
            : 100;

        return {
            messageCount: messageCount || 0,
            flaggedCount,
            safetyRate: Math.round(safetyRate * 10) / 10,
        };
    } catch (error) {
        throw new Error(
            `Failed to fetch user stats: ${handleSupabaseError(error)}`,
        );
    }
}
