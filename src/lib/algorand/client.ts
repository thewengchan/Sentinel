/**
 * Algorand client utilities using AlgoKit
 * Wrapper around @algorandfoundation/algokit-utils for blockchain interactions
 */

import { AlgorandClient as AlgoKitClient } from "@algorandfoundation/algokit-utils";
import type { Wallet } from "@txnlab/use-wallet-svelte";
import type { TransactionSigner } from "algosdk";
import type {
    AlgoAccount,
    AlgoBalance,
    AlgoNetworkInfo,
    AlgoTransaction,
    TransactionParams,
} from "./types";

export class AlgorandClient {
    private client: AlgoKitClient;
    private network: "testnet" | "mainnet";

    constructor(network: "testnet" | "mainnet" = "testnet") {
        this.network = network;
        this.client = network === "mainnet"
            ? AlgoKitClient.mainNet()
            : AlgoKitClient.testNet();
    }

    /**
     * Get account information including balance and assets
     */
    async getAccountInfo(address: string): Promise<AlgoAccount | null> {
        try {
            const accountInfo = await this.client.client.algod
                .accountInformation(address).do();

            return {
                address: accountInfo.address,
                amount: Number(accountInfo.amount),
                amountWithoutPendingRewards: Number(
                    accountInfo.amountWithoutPendingRewards || 0,
                ),
                pendingRewards: Number(accountInfo.pendingRewards || 0),
                rewards: Number(accountInfo.rewards || 0),
                round: Number(accountInfo.round),
                status: accountInfo.status,
                assets: accountInfo.assets?.map((asset) => ({
                    assetId: Number(asset.assetId),
                    amount: Number(asset.amount),
                    creator: "",
                    frozen: asset.isFrozen || false,
                    decimals: 0,
                    name: undefined,
                    unitName: undefined,
                })),
                createdApps: accountInfo.createdApps?.map((app) =>
                    Number(app.id)
                ) ||
                    [],
                createdAssets: accountInfo.createdAssets?.map((asset) =>
                    Number(asset.index)
                ) || [],
                minBalance: Number(accountInfo.minBalance || 0),
            };
        } catch (error) {
            console.error("Error fetching account info:", error);
            return null;
        }
    }

    /**
     * Get account balance in ALGO and assets
     */
    async getBalance(address: string): Promise<AlgoBalance | null> {
        try {
            const accountInfo = await this.getAccountInfo(address);
            if (!accountInfo) return null;

            return {
                algo: accountInfo.amount / 1_000_000, // Convert microAlgos to ALGO
                assets: accountInfo.assets?.map((asset) => ({
                    assetId: asset.assetId,
                    amount: asset.amount / Math.pow(10, asset.decimals || 0),
                    decimals: asset.decimals,
                    name: asset.name,
                    unitName: asset.unitName,
                })) || [],
            };
        } catch (error) {
            console.error("Error fetching balance:", error);
            return null;
        }
    }

    /**
     * Get recent transactions for an account
     */
    async getTransactions(
        address: string,
        limit: number = 20,
    ): Promise<AlgoTransaction[]> {
        try {
            const response = await this.client.client.indexer
                .searchForTransactions()
                .address(address)
                .limit(limit)
                .do();

            if (!response.transactions) return [];

            return response.transactions.map((tx) => {
                const paymentTxn = tx.paymentTransaction;
                const assetTransferTxn = tx.assetTransferTransaction;

                return {
                    id: String(tx.id || ""),
                    sender: String(tx.sender || ""),
                    receiver: String(
                        paymentTxn?.receiver ||
                            assetTransferTxn?.receiver ||
                            "",
                    ),
                    amount: Number(
                        paymentTxn?.amount ||
                            assetTransferTxn?.amount ||
                            0,
                    ),
                    fee: Number(tx.fee || 0),
                    type: String(tx.txType || "pay") as
                        | "pay"
                        | "axfer"
                        | "acfg"
                        | "afrz"
                        | "keyreg"
                        | "appl",
                    roundTime: Number(tx.roundTime || 0),
                    confirmedRound: Number(tx.confirmedRound || 0),
                    note: tx.note ? atob(String(tx.note)) : undefined,
                    assetId: Number(assetTransferTxn?.assetId || 0),
                };
            });
        } catch (error) {
            console.error("Error fetching transactions:", error);
            return [];
        }
    }

    /**
     * Get network information
     */
    async getNetworkInfo(): Promise<AlgoNetworkInfo | null> {
        try {
            const status = await this.client.client.algod.status().do();

            return {
                network: this.network,
                lastRound: Number(status.lastRound || 0),
                genesisId: String(
                    (status as unknown as Record<string, unknown>).genesisId ||
                        "",
                ),
                genesisHash: String(
                    (status as unknown as Record<string, unknown>)
                        .genesisHash || "",
                ),
            };
        } catch (error) {
            console.error("Error fetching network info:", error);
            return null;
        }
    }

    /**
     * Get suggested transaction parameters
     */
    async getSuggestedParams(): Promise<TransactionParams | null> {
        try {
            const params = await this.client.client.algod.getTransactionParams()
                .do();

            return {
                fee: Number(params.fee || params.minFee || 0),
                firstRound: Number(params.firstValid || 0),
                lastRound: Number(params.lastValid || 0),
                genesisID: String(params.genesisID || ""),
                genesisHash: typeof params.genesisHash === "string"
                    ? params.genesisHash
                    : btoa(
                        String.fromCharCode(
                            ...new Uint8Array(params.genesisHash),
                        ),
                    ),
            };
        } catch (error) {
            console.error("Error fetching suggested params:", error);
            return null;
        }
    }

    /**
     * Get asset information
     */
    async getAssetInfo(
        assetId: number,
    ): Promise<Record<string, unknown> | null> {
        try {
            const assetInfo = await this.client.client.algod.getAssetByID(
                assetId,
            ).do();
            return assetInfo as unknown as Record<string, unknown>;
        } catch (error) {
            console.error("Error fetching asset info:", error);
            return null;
        }
    }

    /**
     * Check if address is valid
     */
    static isValidAddress(address: string): boolean {
        // Simple validation: Algorand addresses are 58 characters long
        if (!address || address.length !== 58) return false;

        // Check if it contains only valid base32 characters
        const validChars = /^[A-Z2-7]+$/;
        return validChars.test(address);
    }

    /**
     * Format address for display (truncate middle)
     */
    static formatAddress(
        address: string,
        startChars: number = 6,
        endChars: number = 4,
    ): string {
        if (!address) return "";
        if (address.length <= startChars + endChars) return address;
        return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
    }

    /**
     * Convert microAlgos to ALGO
     */
    static microAlgosToAlgo(microAlgos: number): number {
        return microAlgos / 1_000_000;
    }

    /**
     * Convert ALGO to microAlgos
     */
    static algoToMicroAlgos(algo: number): number {
        return Math.floor(algo * 1_000_000);
    }

    /**
     * Get the underlying AlgoKit client for advanced operations
     */
    getAlgoKitClient(): AlgoKitClient {
        return this.client;
    }

    /**
     * Set up a signer for a wallet account
     * Integrates @txnlab/use-wallet-svelte with AlgoKit's transaction signing
     */
    setSigner(
        wallet: Wallet,
        transactionSigner: TransactionSigner,
    ): AlgorandClient {
        const accounts = wallet.accounts?.current;

        if (!accounts || accounts.length === 0) {
            throw new Error("No accounts found in wallet");
        }

        // Set up signer for each account in the wallet
        accounts.forEach((account: { address: string; name?: string }) => {
            this.client.setSigner(account.address, transactionSigner);
        });

        return this;
    }
}

// Export singleton instances
export const testnetClient = new AlgorandClient("testnet");
export const mainnetClient = new AlgorandClient("mainnet");
