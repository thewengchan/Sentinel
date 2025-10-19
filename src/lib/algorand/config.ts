/**
 * Smart Contract Configuration
 * Configuration for Algorand smart contract integration
 *
 * Note: APP_ID is PUBLIC information (visible on blockchain)
 * It's safe to expose to the browser
 */

import { env } from "$env/dynamic/public";

export const SMART_CONTRACT_CONFIG = {
    APP_ID: env.PUBLIC_ALGORAND_APP_ID,
    NETWORK: env.PUBLIC_ALGORAND_NETWORK,
    METHOD_NAME: "record_incident",
} as const;

export type SmartContractConfig = typeof SMART_CONTRACT_CONFIG;

/**
 * Check if blockchain integration is properly configured
 */
export function isBlockchainConfigured(): boolean {
    return SMART_CONTRACT_CONFIG.APP_ID !== undefined;
}

/**
 * Get configuration status message
 */
export function getConfigStatus(): string {
    if (!isBlockchainConfigured()) {
        return "Blockchain integration disabled: ALGORAND_APP_ID not configured";
    }
    return `Blockchain configured: APP_ID=${SMART_CONTRACT_CONFIG.APP_ID}, NETWORK=${SMART_CONTRACT_CONFIG.NETWORK}`;
}
