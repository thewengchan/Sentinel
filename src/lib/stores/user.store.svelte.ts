/**
 * User Preferences Store - Manages user preferences and settings
 * Uses Svelte 5 runes for reactive state management
 * Migrated from localStorage to Supabase
 */

import { showErrorToast } from "$lib/utils/supabase-errors";

interface SavedAddress {
    address: string;
    label: string;
    createdAt: string;
}

interface NotificationPreferences {
    enabled: boolean;
    transactionAlerts: boolean;
    chatNotifications: boolean;
}

interface DisplayPreferences {
    compactMode: boolean;
    showBalanceInUSD: boolean;
}

interface UserPreferences {
    savedAddresses: SavedAddress[];
    notifications: NotificationPreferences;
    display: DisplayPreferences;
}

interface UserState {
    preferences: UserPreferences;
    currentWalletAddress: string | null;
    userId: string | null;
    email: string | null;
    fullName: string | null;
    avatarUrl: string | null;
    isLoaded: boolean;
    isLoading: boolean;
    error: string | null;
}

const DEFAULT_PREFERENCES: UserPreferences = {
    savedAddresses: [],
    notifications: {
        enabled: true,
        transactionAlerts: true,
        chatNotifications: false,
    },
    display: {
        compactMode: false,
        showBalanceInUSD: true,
    },
};

class UserStore {
    private state = $state<UserState>({
        preferences: DEFAULT_PREFERENCES,
        currentWalletAddress: null,
        userId: null,
        email: null,
        fullName: null,
        avatarUrl: null,
        isLoaded: false,
        isLoading: false,
        error: null,
    });

    // Getters
    get preferences() {
        return this.state.preferences;
    }

    get savedAddresses() {
        return this.state.preferences.savedAddresses;
    }

    get notifications() {
        return this.state.preferences.notifications;
    }

    get display() {
        return this.state.preferences.display;
    }

    get currentWalletAddress() {
        return this.state.currentWalletAddress;
    }

    get isLoaded() {
        return this.state.isLoaded;
    }

    get isLoading() {
        return this.state.isLoading;
    }

    get error() {
        return this.state.error;
    }

    get userId() {
        return this.state.userId;
    }

    get email() {
        return this.state.email;
    }

    get fullName() {
        return this.state.fullName;
    }

    get avatarUrl() {
        return this.state.avatarUrl;
    }

    /**
     * Load user data and preferences from Supabase
     */
    async load(
        userId: string,
        email?: string,
        fullName?: string,
        avatarUrl?: string,
        walletAddress?: string,
    ): Promise<void> {
        if (!userId) {
            this.state.error = "User ID is required";
            return;
        }

        this.state.userId = userId;
        this.state.email = email || null;
        this.state.fullName = fullName || null;
        this.state.avatarUrl = avatarUrl || null;
        this.state.currentWalletAddress = walletAddress || null;
        this.state.isLoading = true;
        this.state.error = null;

        try {
            const response = await fetch("/api/user/preferences", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to load preferences");
            }

            const result = await response.json();

            if (result.success && result.preferences) {
                this.state.preferences = {
                    ...DEFAULT_PREFERENCES,
                    ...result.preferences,
                };
            } else {
                // No preferences found, use defaults
                this.state.preferences = DEFAULT_PREFERENCES;
            }

            this.state.isLoaded = true;
            this.state.error = null;
        } catch (error) {
            console.error("Failed to load user preferences:", error);
            this.state.error = error instanceof Error
                ? error.message
                : "Failed to load preferences";
            this.state.preferences = DEFAULT_PREFERENCES; // Fallback to defaults
            this.state.isLoaded = true;
            showErrorToast(error, "Failed to load preferences");
        } finally {
            this.state.isLoading = false;
        }
    }

    /**
     * Save preferences to Supabase
     */
    private async save(): Promise<void> {
        if (!this.state.userId) {
            console.warn(
                "Cannot save preferences: missing userId",
            );
            return;
        }

        try {
            const response = await fetch("/api/user/preferences", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    preferences: this.state.preferences,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save preferences");
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || "Failed to save preferences");
            }
        } catch (error) {
            console.error("Failed to save user preferences:", error);
            showErrorToast(error, "Failed to save preferences");
            throw error; // Re-throw so calling methods can handle it
        }
    }

    /**
     * Add a saved address
     */
    async addSavedAddress(address: string, label: string): Promise<void> {
        const exists = this.state.preferences.savedAddresses.some((addr) =>
            addr.address === address
        );
        if (exists) {
            // Update label if address already exists
            this.state.preferences.savedAddresses = this.state.preferences
                .savedAddresses.map((addr) =>
                    addr.address === address ? { ...addr, label } : addr
                );
        } else {
            this.state.preferences.savedAddresses = [
                ...this.state.preferences.savedAddresses,
                {
                    address,
                    label,
                    createdAt: new Date().toISOString(),
                },
            ];
        }
        await this.save();
    }

    /**
     * Remove a saved address
     */
    async removeSavedAddress(address: string): Promise<void> {
        this.state.preferences.savedAddresses = this.state.preferences
            .savedAddresses.filter(
                (addr) => addr.address !== address,
            );
        await this.save();
    }

    /**
     * Get label for an address
     */
    getAddressLabel(address: string): string | null {
        const saved = this.state.preferences.savedAddresses.find((addr) =>
            addr.address === address
        );
        return saved?.label || null;
    }

    /**
     * Update notification preferences
     */
    async updateNotifications(
        updates: Partial<NotificationPreferences>,
    ): Promise<void> {
        this.state.preferences.notifications = {
            ...this.state.preferences.notifications,
            ...updates,
        };
        await this.save();
    }

    /**
     * Update display preferences
     */
    async updateDisplay(updates: Partial<DisplayPreferences>): Promise<void> {
        this.state.preferences.display = {
            ...this.state.preferences.display,
            ...updates,
        };
        await this.save();
    }

    /**
     * Reset preferences to defaults
     */
    async reset(): Promise<void> {
        this.state.preferences = DEFAULT_PREFERENCES;
        await this.save();
    }

    /**
     * Clear all data
     */
    clear(): void {
        this.state = {
            preferences: DEFAULT_PREFERENCES,
            currentWalletAddress: null,
            userId: null,
            email: null,
            fullName: null,
            avatarUrl: null,
            isLoaded: false,
            isLoading: false,
            error: null,
        };
    }
}

// Export singleton instance
export const userStore = new UserStore();
