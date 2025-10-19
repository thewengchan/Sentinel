/**
 * Connect Wallet API
 * Connects a wallet address to the authenticated user's account
 */

import { json, type RequestHandler } from "@sveltejs/kit";
import { getSupabaseClient, handleSupabaseError } from "$lib/supabase/client";
import type { Tables } from "$lib/supabase/client";

interface ConnectWalletRequest {
    wallet_address: string;
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

        const { wallet_address }: ConnectWalletRequest = await request.json();

        if (!wallet_address) {
            return json({
                success: false,
                error: "Wallet address is required",
            }, { status: 400 });
        }

        const supabase = getSupabaseClient(locals);

        // Connect wallet to user using the database function
        const { data: userData, error: connectError } = await supabase.rpc(
            "connect_wallet_to_user",
            {
                wallet_addr: wallet_address,
            },
        );

        if (connectError) {
            console.error("Connect wallet error:", connectError);
            return json({
                success: false,
                error: handleSupabaseError(connectError),
            }, { status: 500 });
        }

        if (!userData) {
            return json({
                success: false,
                error: "Failed to connect wallet",
            }, { status: 500 });
        }

        return json({
            success: true,
            user: userData,
        });
    } catch (error) {
        console.error("Connect wallet setup error:", error);
        return json({
            success: false,
            error: error instanceof Error
                ? error.message
                : "Unknown error occurred",
        }, { status: 500 });
    }
};
