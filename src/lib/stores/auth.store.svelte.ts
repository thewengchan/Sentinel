/**
 * Authentication Store - Manages Supabase Auth state
 * Uses Svelte 5 runes for reactive state management
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { showErrorToast } from "$lib/utils/supabase-errors";

interface AuthUser {
    id: string;
    email?: string;
    full_name?: string;
    avatar_url?: string;
}

interface AuthState {
    user: AuthUser | null;
    session: unknown | null;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
}

class AuthStore {
    private state = $state<AuthState>({
        user: null,
        session: null,
        isLoading: false,
        isInitialized: false,
        error: null,
    });

    private supabase: SupabaseClient | null = null;

    // Getters
    get user() {
        return this.state.user;
    }

    get session() {
        return this.state.session;
    }

    get isLoading() {
        return this.state.isLoading;
    }

    get isInitialized() {
        return this.state.isInitialized;
    }

    get error() {
        return this.state.error;
    }

    get isAuthenticated() {
        return this.state.user !== null && this.state.session !== null;
    }

    /**
     * Set the Supabase client instance
     */
    setSupabaseClient(client: SupabaseClient) {
        this.supabase = client;
    }

    /**
     * Initialize auth store with session data
     */
    async initialize(sessionData?: unknown) {
        if (!this.supabase) {
            console.error(
                "Supabase client not set. Call setSupabaseClient() first.",
            );
            this.state.error = "Supabase client not initialized";
            return;
        }

        this.state.isLoading = true;
        this.state.error = null;

        try {
            if (sessionData) {
                // Use provided session data
                this.state.session = sessionData;
                this.state.user = this.extractUserFromSession(sessionData);
            } else {
                // Get current session
                const { data: { session }, error } = await this.supabase.auth
                    .getSession();

                if (error) {
                    throw error;
                }

                this.state.session = session;
                this.state.user = session
                    ? this.extractUserFromSession(session)
                    : null;
            }

            this.state.isInitialized = true;
        } catch (error) {
            console.error("Auth initialization error:", error);
            this.state.error = error instanceof Error
                ? error.message
                : "Failed to initialize auth";
            this.state.user = null;
            this.state.session = null;
        } finally {
            this.state.isLoading = false;
        }
    }

    /**
     * Sign in with email and password
     */
    async signIn(email: string, password: string): Promise<boolean> {
        if (!this.supabase) {
            console.error(
                "Supabase client not set. Call setSupabaseClient() first.",
            );
            this.state.error = "Supabase client not initialized";
            return false;
        }

        this.state.isLoading = true;
        this.state.error = null;

        try {
            const { data, error } = await this.supabase.auth.signInWithPassword(
                {
                    email,
                    password,
                },
            );

            if (error) {
                throw error;
            }

            this.state.session = data.session;
            this.state.user = data.user
                ? this.extractUserFromSession(data.session)
                : null;

            return true;
        } catch (error) {
            console.error("Sign in error:", error);
            this.state.error = error instanceof Error
                ? error.message
                : "Failed to sign in";
            showErrorToast(error, "Sign in failed");
            return false;
        } finally {
            this.state.isLoading = false;
        }
    }

    /**
     * Sign up with email and password
     */
    async signUp(
        email: string,
        password: string,
        fullName?: string,
    ): Promise<boolean> {
        if (!this.supabase) {
            console.error(
                "Supabase client not set. Call setSupabaseClient() first.",
            );
            this.state.error = "Supabase client not initialized";
            return false;
        }

        this.state.isLoading = true;
        this.state.error = null;

        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) {
                throw error;
            }

            // Note: User might need to confirm email before session is available
            if (data.session) {
                this.state.session = data.session;
                this.state.user = data.user
                    ? this.extractUserFromSession(data.session)
                    : null;
            }

            return true;
        } catch (error) {
            console.error("Sign up error:", error);
            this.state.error = error instanceof Error
                ? error.message
                : "Failed to sign up";
            showErrorToast(error, "Sign up failed");
            return false;
        } finally {
            this.state.isLoading = false;
        }
    }

    /**
     * Sign out
     */
    async signOut(): Promise<boolean> {
        if (!this.supabase) {
            console.error(
                "Supabase client not set. Call setSupabaseClient() first.",
            );
            this.state.error = "Supabase client not initialized";
            return false;
        }

        this.state.isLoading = true;
        this.state.error = null;

        try {
            const { error } = await this.supabase.auth.signOut();

            if (error) {
                throw error;
            }

            this.state.session = null;
            this.state.user = null;

            return true;
        } catch (error) {
            console.error("Sign out error:", error);
            this.state.error = error instanceof Error
                ? error.message
                : "Failed to sign out";
            showErrorToast(error, "Sign out failed");
            return false;
        } finally {
            this.state.isLoading = false;
        }
    }

    /**
     * Reset password
     */
    async resetPassword(email: string): Promise<boolean> {
        if (!this.supabase) {
            console.error(
                "Supabase client not set. Call setSupabaseClient() first.",
            );
            this.state.error = "Supabase client not initialized";
            return false;
        }

        this.state.isLoading = true;
        this.state.error = null;

        try {
            const { error } = await this.supabase.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo: `${window.location.origin}/auth/reset-password`,
                },
            );

            if (error) {
                throw error;
            }

            return true;
        } catch (error) {
            console.error("Reset password error:", error);
            this.state.error = error instanceof Error
                ? error.message
                : "Failed to reset password";
            showErrorToast(error, "Password reset failed");
            return false;
        } finally {
            this.state.isLoading = false;
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(
        updates: { full_name?: string; avatar_url?: string },
    ): Promise<boolean> {
        if (!this.supabase) {
            console.error(
                "Supabase client not set. Call setSupabaseClient() first.",
            );
            this.state.error = "Supabase client not initialized";
            return false;
        }

        if (!this.state.user) {
            this.state.error = "No user logged in";
            return false;
        }

        this.state.isLoading = true;
        this.state.error = null;

        try {
            const { error } = await this.supabase.auth.updateUser({
                data: updates,
            });

            if (error) {
                throw error;
            }

            // Update local state
            if (updates.full_name) {
                this.state.user.full_name = updates.full_name;
            }
            if (updates.avatar_url) {
                this.state.user.avatar_url = updates.avatar_url;
            }

            return true;
        } catch (error) {
            console.error("Update profile error:", error);
            this.state.error = error instanceof Error
                ? error.message
                : "Failed to update profile";
            showErrorToast(error, "Profile update failed");
            return false;
        } finally {
            this.state.isLoading = false;
        }
    }

    /**
     * Clear error state
     */
    clearError() {
        this.state.error = null;
    }

    /**
     * Extract user data from session
     */
    private extractUserFromSession(session: unknown): AuthUser | null {
        if (!session || typeof session !== "object" || !("user" in session)) {
            return null;
        }

        const sessionObj = session as { user: unknown };
        if (!sessionObj.user || typeof sessionObj.user !== "object") {
            return null;
        }

        const user = sessionObj.user as {
            id: string;
            email?: string;
            user_metadata?: {
                full_name?: string;
                name?: string;
                avatar_url?: string;
            };
        };

        return {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name ||
                user.user_metadata?.name,
            avatar_url: user.user_metadata?.avatar_url,
        };
    }

    /**
     * Reset store to initial state
     */
    reset() {
        this.state = {
            user: null,
            session: null,
            isLoading: false,
            isInitialized: false,
            error: null,
        };
    }
}

// Export singleton instance
export const authStore = new AuthStore();
