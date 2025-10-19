/**
 * Smart Contract Configuration
 * Configuration for Algorand smart contract integration
 */

export const SMART_CONTRACT_CONFIG = {
    APP_ID: process.env.ALGORAND_APP_ID || 0, // Smart contract app ID
    NETWORK: process.env.ALGORAND_NETWORK || "testnet",
    METHOD_NAME: "submit_incident",
} as const;

export type SmartContractConfig = typeof SMART_CONTRACT_CONFIG;
