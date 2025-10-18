/**
 * Type-safe localStorage utilities
 */

import { browser } from "$app/environment";

export class Storage {
    /**
     * Get item from localStorage with type safety
     */
    static get<T>(key: string, defaultValue: T): T {
        if (!browser) return defaultValue;

        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            return JSON.parse(item) as T;
        } catch (error) {
            console.error(
                `Error reading from localStorage key "${key}":`,
                error,
            );
            return defaultValue;
        }
    }

    /**
     * Set item in localStorage
     */
    static set<T>(key: string, value: T): void {
        if (!browser) return;

        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error);
        }
    }

    /**
     * Remove item from localStorage
     */
    static remove(key: string): void {
        if (!browser) return;

        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(
                `Error removing from localStorage key "${key}":`,
                error,
            );
        }
    }

    /**
     * Clear all items from localStorage
     */
    static clear(): void {
        if (!browser) return;

        try {
            localStorage.clear();
        } catch (error) {
            console.error("Error clearing localStorage:", error);
        }
    }

    /**
     * Check if a key exists in localStorage
     */
    static has(key: string): boolean {
        if (!browser) return false;
        return localStorage.getItem(key) !== null;
    }
}

/**
 * Storage keys used throughout the app
 */
export const StorageKeys = {
    // Chat
    CHAT_SESSIONS: "sentinel_chat_sessions",
    CHAT_CURRENT_SESSION: "sentinel_chat_current_session",

    // User preferences
    USER_PREFERENCES: "sentinel_user_preferences",

    // Analytics
    ANALYTICS_SESSION_ID: "sentinel_analytics_session_id",
    // Wallet (we don't persist wallet connection)
} as const;
