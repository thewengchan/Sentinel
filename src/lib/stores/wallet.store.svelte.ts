/**
 * Wallet Store - Manages wallet connection state
 * Uses Svelte 5 runes for reactive state management
 */

import type { Wallet } from "@txnlab/use-wallet-svelte";

interface WalletAccount {
    address: string;
    name?: string;
}

interface WalletState {
    isConnected: boolean;
    isConnecting: boolean;
    wallet: Wallet | null;
    accounts: WalletAccount[];
    activeAccount: WalletAccount | null;
    network: "testnet" | "mainnet" | null;
    error: string | null;
}

class WalletStore {
    private state = $state<WalletState>({
        isConnected: false,
        isConnecting: false,
        wallet: null,
        accounts: [],
        activeAccount: null,
        network: null,
        error: null,
    });

    // Getters using $derived
    get isConnected() {
        return this.state.isConnected;
    }

    get isConnecting() {
        return this.state.isConnecting;
    }

    get wallet() {
        return this.state.wallet;
    }

    get accounts() {
        return this.state.accounts;
    }

    get activeAccount() {
        return this.state.activeAccount;
    }

    get activeAddress() {
        return this.state.activeAccount?.address || null;
    }

    get network() {
        return this.state.network;
    }

    get error() {
        return this.state.error;
    }

    get walletType() {
        return this.state.wallet?.metadata.name || null;
    }

    get walletIcon() {
        return this.state.wallet?.metadata.icon || null;
    }

    /**
     * Set wallet connection state
     */
    setWallet(wallet: Wallet | null) {
        this.state.wallet = wallet;
        this.state.isConnected = wallet !== null &&
            (typeof wallet.isConnected === "function"
                ? wallet.isConnected()
                : wallet.isConnected);

        if (wallet && wallet.accounts?.current) {
            this.state.accounts = wallet.accounts.current.map((
                acc: WalletAccount,
            ) => ({
                address: acc.address,
                name: acc.name,
            }));

            // Set active account (first account is typically the active one)
            if (this.state.accounts.length > 0) {
                this.state.activeAccount = this.state.accounts[0];
            }
        }
    }

    /**
     * Set connecting state
     */
    setConnecting(isConnecting: boolean) {
        this.state.isConnecting = isConnecting;
    }

    /**
     * Set network
     */
    setNetwork(network: "testnet" | "mainnet") {
        this.state.network = network;
    }

    /**
     * Set error
     */
    setError(error: string | null) {
        this.state.error = error;
    }

    /**
     * Update active account
     */
    setActiveAccount(address: string) {
        const account = this.state.accounts.find((acc) =>
            acc.address === address
        );
        if (account) {
            this.state.activeAccount = account;
        }
    }

    /**
     * Disconnect wallet and clear state
     */
    disconnect() {
        this.state.isConnected = false;
        this.state.wallet = null;
        this.state.accounts = [];
        this.state.activeAccount = null;
        this.state.error = null;
    }

    /**
     * Reset store to initial state
     */
    reset() {
        this.state = {
            isConnected: false,
            isConnecting: false,
            wallet: null,
            accounts: [],
            activeAccount: null,
            network: null,
            error: null,
        };
    }
}

// Export singleton instance
export const walletStore = new WalletStore();
