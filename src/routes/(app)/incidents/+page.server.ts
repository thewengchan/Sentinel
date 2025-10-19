import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
    // Require authentication
    if (!user) {
        throw redirect(303, "/auth/login");
    }

    // Get user's wallet address
    const { data: userData } = await supabase
        .from("users")
        .select("wallet_address")
        .eq("id", user.id)
        .single();

    if (!userData?.wallet_address) {
        return {
            incidents: [],
            walletAddress: null,
        };
    }

    // Fetch incidents for this user's wallet
    const { data: incidents, error } = await supabase
        .from("incidents")
        .select(
            `
            id,
            session_id,
            message_id,
            from_side,
            ts,
            severity,
            category,
            action,
            tx_id,
            chain_status,
            policy_version,
            content_hash
        `,
        )
        .eq("wallet_address", userData.wallet_address)
        .order("ts", { ascending: false })
        .limit(50);

    if (error) {
        console.error("Error fetching incidents:", error);
        return {
            incidents: [],
            walletAddress: userData.wallet_address,
            error: error.message,
        };
    }

    return {
        incidents: incidents || [],
        walletAddress: userData.wallet_address,
    };
};
