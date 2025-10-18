/**
 * Type definitions for Algorand blockchain data
 */

export interface AlgoAccount {
    address: string;
    amount: number; // microAlgos
    amountWithoutPendingRewards: number;
    pendingRewards: number;
    rewards: number;
    round: number;
    status: string;
    assets?: AlgoAsset[];
    createdApps?: number[];
    createdAssets?: number[];
    minBalance: number;
}

export interface AlgoAsset {
    assetId: number;
    amount: number;
    creator: string;
    frozen: boolean;
    decimals: number;
    name?: string;
    unitName?: string;
}

export interface AlgoTransaction {
    id: string;
    sender: string;
    receiver?: string;
    amount: number;
    fee: number;
    type: "pay" | "axfer" | "acfg" | "afrz" | "keyreg" | "appl";
    roundTime: number;
    confirmedRound: number;
    note?: string;
    assetId?: number;
}

export interface AlgoNetworkInfo {
    network: "mainnet" | "testnet" | "betanet";
    lastRound: number;
    genesisId: string;
    genesisHash: string;
}

export interface AlgoBalance {
    algo: number; // in ALGO (not microAlgos)
    assets: {
        assetId: number;
        amount: number;
        decimals: number;
        name?: string;
        unitName?: string;
    }[];
}

export interface TransactionParams {
    fee: number;
    firstRound: number;
    lastRound: number;
    genesisID: string;
    genesisHash: string;
}
