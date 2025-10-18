/**
 * Blockchain Store - Manages cached blockchain data
 * Uses Svelte 5 runes for reactive state management
 */

import type {
    AlgoBalance,
    AlgoNetworkInfo,
    AlgoTransaction,
} from "$lib/algorand/types";
import {
    AlgorandClient,
    mainnetClient,
    testnetClient,
} from "$lib/algorand/client";

interface BlockchainState {
    balance: AlgoBalance | null;
    transactions: AlgoTransaction[];
    networkInfo: AlgoNetworkInfo | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: number | null;
}

class BlockchainStore {
    private state = $state<BlockchainState>({
        balance: null,
        transactions: [],
        networkInfo: null,
        isLoading: false,
        error: null,
        lastUpdated: null,
    });

    private refreshInterval: ReturnType<typeof setInterval> | null = null;
    private currentClient: AlgorandClient = testnetClient;

    // Getters
    get balance() {
        return this.state.balance;
    }

    get algoBalance() {
        return this.state.balance?.algo || 0;
    }

    get assets() {
        return this.state.balance?.assets || [];
    }

    get transactions() {
        return this.state.transactions;
    }

    get networkInfo() {
        return this.state.networkInfo;
    }

    get isLoading() {
        return this.state.isLoading;
    }

    get error() {
        return this.state.error;
    }

    get lastUpdated() {
        return this.state.lastUpdated;
    }

    get network() {
        return this.state.networkInfo?.network || null;
    }

    /**
     * Set the network client
     */
    setNetwork(network: "testnet" | "mainnet") {
        this.currentClient = network === "mainnet"
            ? mainnetClient
            : testnetClient;
    }

    /**
     * Fetch account balance
     */
    async fetchBalance(address: string): Promise<void> {
        if (!address || !AlgorandClient.isValidAddress(address)) {
            this.state.error = "Invalid address";
            return;
        }

        this.state.isLoading = true;
        this.state.error = null;

        try {
            const balance = await this.currentClient.getBalance(address);
            this.state.balance = balance;
            this.state.lastUpdated = Date.now();
        } catch (error) {
            this.state.error = error instanceof Error
                ? error.message
                : "Failed to fetch balance";
            console.error("Error fetching balance:", error);
        } finally {
            this.state.isLoading = false;
        }
    }

    /**
     * Fetch transaction history
     */
    async fetchTransactions(
        address: string,
        limit: number = 20,
    ): Promise<void> {
        if (!address || !AlgorandClient.isValidAddress(address)) {
            this.state.error = "Invalid address";
            return;
        }

        this.state.isLoading = true;
        this.state.error = null;

        try {
            const transactions = await this.currentClient.getTransactions(
                address,
                limit,
            );
            this.state.transactions = transactions;
            this.state.lastUpdated = Date.now();
        } catch (error) {
            this.state.error = error instanceof Error
                ? error.message
                : "Failed to fetch transactions";
            console.error("Error fetching transactions:", error);
        } finally {
            this.state.isLoading = false;
        }
    }

    /**
     * Fetch network information
     */
    async fetchNetworkInfo(): Promise<void> {
        this.state.isLoading = true;
        this.state.error = null;

        try {
            const networkInfo = await this.currentClient.getNetworkInfo();
            this.state.networkInfo = networkInfo;
        } catch (error) {
            this.state.error = error instanceof Error
                ? error.message
                : "Failed to fetch network info";
            console.error("Error fetching network info:", error);
        } finally {
            this.state.isLoading = false;
        }
    }

    /**
     * Fetch all blockchain data for an address
     */
    async fetchAll(address: string): Promise<void> {
        await Promise.all([
            this.fetchBalance(address),
            this.fetchTransactions(address),
            this.fetchNetworkInfo(),
        ]);
    }

    /**
     * Refresh all data
     */
    async refresh(address: string): Promise<void> {
        if (!address) return;
        await this.fetchAll(address);
    }

    /**
     * Start auto-refresh (every 30 seconds)
     */
    startAutoRefresh(address: string, intervalMs: number = 30000): void {
        this.stopAutoRefresh();

        this.refreshInterval = setInterval(async () => {
            if (address) {
                await this.refresh(address);
            }
        }, intervalMs);
    }

    /**
     * Stop auto-refresh
     */
    stopAutoRefresh(): void {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * Clear all blockchain data
     */
    clear(): void {
        this.stopAutoRefresh();
        this.state = {
            balance: null,
            transactions: [],
            networkInfo: null,
            isLoading: false,
            error: null,
            lastUpdated: null,
        };
    }

    /**
     * Format address for display
     */
    formatAddress(
        address: string,
        startChars?: number,
        endChars?: number,
    ): string {
        return AlgorandClient.formatAddress(address, startChars, endChars);
    }
}

// Export singleton instance
export const blockchainStore = new BlockchainStore();
