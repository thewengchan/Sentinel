/**
 * User Preferences Store - Manages user preferences and settings
 * Uses Svelte 5 runes for reactive state management
 */

import { Storage, StorageKeys } from "$lib/utils/storage";

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
    isLoaded: boolean;
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
        isLoaded: false,
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

    /**
     * Load preferences from localStorage
     */
    load(walletAddress?: string): void {
        if (walletAddress) {
            this.state.currentWalletAddress = walletAddress;
        }

        // Load preferences specific to the wallet address if provided
        const storageKey = walletAddress
            ? `${StorageKeys.USER_PREFERENCES}_${walletAddress}`
            : StorageKeys.USER_PREFERENCES;

        const stored = Storage.get<UserPreferences>(
            storageKey,
            DEFAULT_PREFERENCES,
        );
        this.state.preferences = { ...DEFAULT_PREFERENCES, ...stored };
        this.state.isLoaded = true;
    }

    /**
     * Save preferences to localStorage
     */
    private save(): void {
        const storageKey = this.state.currentWalletAddress
            ? `${StorageKeys.USER_PREFERENCES}_${this.state.currentWalletAddress}`
            : StorageKeys.USER_PREFERENCES;

        Storage.set(storageKey, this.state.preferences);
    }

    /**
     * Add a saved address
     */
    addSavedAddress(address: string, label: string): void {
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
        this.save();
    }

    /**
     * Remove a saved address
     */
    removeSavedAddress(address: string): void {
        this.state.preferences.savedAddresses = this.state.preferences
            .savedAddresses.filter(
                (addr) => addr.address !== address,
            );
        this.save();
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
    updateNotifications(updates: Partial<NotificationPreferences>): void {
        this.state.preferences.notifications = {
            ...this.state.preferences.notifications,
            ...updates,
        };
        this.save();
    }

    /**
     * Update display preferences
     */
    updateDisplay(updates: Partial<DisplayPreferences>): void {
        this.state.preferences.display = {
            ...this.state.preferences.display,
            ...updates,
        };
        this.save();
    }

    /**
     * Reset preferences to defaults
     */
    reset(): void {
        this.state.preferences = DEFAULT_PREFERENCES;
        this.save();
    }

    /**
     * Clear all data
     */
    clear(): void {
        this.state = {
            preferences: DEFAULT_PREFERENCES,
            currentWalletAddress: null,
            isLoaded: false,
        };
        if (this.state.currentWalletAddress) {
            Storage.remove(
                `${StorageKeys.USER_PREFERENCES}_${this.state.currentWalletAddress}`,
            );
        }
    }
}

// Export singleton instance
export const userStore = new UserStore();
