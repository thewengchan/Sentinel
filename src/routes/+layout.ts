import {
    createBrowserClient,
    createServerClient,
    isBrowser,
} from "@supabase/ssr";
import {
    PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    PUBLIC_SUPABASE_URL,
} from "$env/static/public";
import { authStore } from "$lib/stores/auth.store.svelte.js";
import { userStore } from "$lib/stores/user.store.svelte.js";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
    /**
     * Declare a dependency so the layout can be invalidated, for example, on
     * session refresh.
     */
    depends("supabase:auth");

    const supabase = isBrowser()
        ? createBrowserClient(
            PUBLIC_SUPABASE_URL,
            PUBLIC_SUPABASE_PUBLISHABLE_KEY,
            {
                global: {
                    fetch,
                },
            },
        )
        : createServerClient(
            PUBLIC_SUPABASE_URL,
            PUBLIC_SUPABASE_PUBLISHABLE_KEY,
            {
                global: {
                    fetch,
                },
                cookies: {
                    getAll() {
                        return data.cookies;
                    },
                },
            },
        );

    /**
     * It's fine to use `getSession` here, because on the client, `getSession` is
     * safe, and on the server, it reads `session` from the `LayoutData`, which
     * safely checked the session using `safeGetSession`.
     */
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Set the Supabase client in the auth store
    if (isBrowser()) {
        authStore.setSupabaseClient(supabase);
    }

    // Initialize auth store on client side
    if (isBrowser() && session && user) {
        await authStore.initialize(session);

        // Load user data if authenticated
        if (user.id) {
            // Get user data from database
            const { data: userData, error } = await supabase
                .from("users")
                .select("wallet_address, email, full_name, avatar_url")
                .eq("id", user.id)
                .single();

            if (!error && userData) {
                await userStore.load(
                    user.id,
                    userData.email || user.email,
                    userData.full_name || user.user_metadata?.full_name,
                    userData.avatar_url || user.user_metadata?.avatar_url,
                    userData.wallet_address,
                );
            }
        }
    }

    return { session, supabase, user };
};
