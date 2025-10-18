/**
 * Algorand client utilities for interacting with the blockchain
 */

import algosdk from "algosdk";
import type {
    AlgoAccount,
    AlgoBalance,
    AlgoNetworkInfo,
    AlgoTransaction,
    TransactionParams,
} from "./types";

// Algorand node configuration
const ALGOD_CONFIG = {
    testnet: {
        server: "https://testnet-api.algonode.cloud",
        port: "",
        token: "",
    },
    mainnet: {
        server: "https://mainnet-api.algonode.cloud",
        port: "",
        token: "",
    },
};

const INDEXER_CONFIG = {
    testnet: {
        server: "https://testnet-idx.algonode.cloud",
        port: "",
        token: "",
    },
    mainnet: {
        server: "https://mainnet-idx.algonode.cloud",
        port: "",
        token: "",
    },
};

export class AlgorandClient {
    private algodClient: algosdk.Algodv2;
    private indexerClient: algosdk.Indexer;
    private network: "testnet" | "mainnet";

    constructor(network: "testnet" | "mainnet" = "testnet") {
        this.network = network;
        const algodConfig = ALGOD_CONFIG[network];
        const indexerConfig = INDEXER_CONFIG[network];

        this.algodClient = new algosdk.Algodv2(
            algodConfig.token,
            algodConfig.server,
            algodConfig.port,
        );
        this.indexerClient = new algosdk.Indexer(
            indexerConfig.token,
            indexerConfig.server,
            indexerConfig.port,
        );
    }

    /**
     * Get account information including balance and assets
     */
    async getAccountInfo(address: string): Promise<AlgoAccount | null> {
        try {
            const accountInfo = await this.algodClient.accountInformation(
                address,
            ).do();
            // Convert algosdk response to our type
            return {
                address: accountInfo.address,
                amount: Number(accountInfo.amount),
                amountWithoutPendingRewards: Number(
                    accountInfo["amount-without-pending-rewards"] || 0,
                ),
                pendingRewards: Number(accountInfo["pending-rewards"] || 0),
                rewards: Number(accountInfo.rewards || 0),
                round: accountInfo.round,
                status: accountInfo.status,
                assets: accountInfo.assets,
                createdApps: accountInfo["created-apps"],
                createdAssets: accountInfo["created-assets"],
                minBalance: Number(accountInfo["min-balance"] || 0),
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
                    amount: asset.amount / Math.pow(10, asset.decimals),
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
            const response = await this.indexerClient
                .searchForTransactions()
                .address(address)
                .limit(limit)
                .do();

            if (!response.transactions) return [];

            return response.transactions.map((tx: Record<string, unknown>) => ({
                id: String(tx.id || ""),
                sender: String(tx.sender || ""),
                receiver: String(
                    (tx["payment-transaction"] as Record<string, unknown>)
                        ?.receiver ||
                        (tx["asset-transfer-transaction"] as Record<
                            string,
                            unknown
                        >)?.receiver ||
                        "",
                ),
                amount: Number(
                    (tx["payment-transaction"] as Record<string, unknown>)
                        ?.amount ||
                        (tx["asset-transfer-transaction"] as Record<
                            string,
                            unknown
                        >)?.amount ||
                        0,
                ),
                fee: Number(tx.fee || 0),
                type: String(tx["tx-type"] || "pay") as
                    | "pay"
                    | "axfer"
                    | "acfg"
                    | "afrz"
                    | "keyreg"
                    | "appl",
                roundTime: Number(tx["round-time"] || 0),
                confirmedRound: Number(tx["confirmed-round"] || 0),
                note: tx.note ? atob(String(tx.note)) : undefined,
                assetId: Number(
                    (tx["asset-transfer-transaction"] as Record<
                        string,
                        unknown
                    >)?.["asset-id"] || 0,
                ),
            }));
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
            const status = await this.algodClient.status().do();

            return {
                network: this.network,
                lastRound: Number(
                    status.lastRound || status["last-round"] || 0,
                ),
                genesisId: String(
                    status.genesisId || status["genesis-id"] || "",
                ),
                genesisHash: String(
                    status.genesisHash || status["genesis-hash"] || "",
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
            const params = await this.algodClient.getTransactionParams().do();
            const genesisHash = params.genesisHash || params["genesis-hash"];

            return {
                fee: Number(params.fee || 0),
                firstRound: Number(
                    params.firstRound || params["first-round"] || 0,
                ),
                lastRound: Number(
                    params.lastRound || params["last-round"] || 0,
                ),
                genesisID: String(
                    params.genesisID || params["genesis-id"] || "",
                ),
                genesisHash: typeof genesisHash === "string"
                    ? genesisHash
                    : Buffer.from(genesisHash).toString("base64"),
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
            const assetInfo = await this.algodClient.getAssetByID(assetId).do();
            return assetInfo as Record<string, unknown>;
        } catch (error) {
            console.error("Error fetching asset info:", error);
            return null;
        }
    }

    /**
     * Check if address is valid
     */
    static isValidAddress(address: string): boolean {
        return algosdk.isValidAddress(address);
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
}

// Export singleton instances
export const testnetClient = new AlgorandClient("testnet");
export const mainnetClient = new AlgorandClient("mainnet");
