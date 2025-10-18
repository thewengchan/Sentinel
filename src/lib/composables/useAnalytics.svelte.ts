/**
 * Analytics Composable
 * Provides convenient methods for tracking analytics events
 */

import { analyticsStore } from "$lib/stores";
import { walletStore } from "$lib/stores";
import type { AnalyticsEventType } from "$lib/stores";

export function useAnalytics() {
    /**
     * Track a custom event
     */
    function track(
        type: AnalyticsEventType,
        data?: Record<string, unknown>,
    ): void {
        const walletAddress = walletStore.activeAddress || undefined;
        analyticsStore.track(type, data, walletAddress);
    }

    /**
     * Track page view
     */
    function trackPageView(path: string, referrer?: string): void {
        analyticsStore.trackPageView(path, referrer);
    }

    /**
     * Track wallet connection
     */
    function trackWalletConnect(
        walletType: string,
        walletAddress: string,
        network: string,
    ): void {
        analyticsStore.trackWalletConnect(walletType, walletAddress, network);
    }

    /**
     * Track wallet disconnection
     */
    function trackWalletDisconnect(walletAddress: string): void {
        analyticsStore.trackWalletDisconnect(walletAddress);
    }

    /**
     * Track transaction
     */
    function trackTransaction(
        status: "initiated" | "completed" | "failed",
        transactionData: Record<string, unknown>,
    ): void {
        const walletAddress = walletStore.activeAddress || undefined;
        analyticsStore.trackTransaction(status, transactionData, walletAddress);
    }

    /**
     * Track feature usage
     */
    function trackFeature(
        feature: string,
        details?: Record<string, unknown>,
    ): void {
        const walletAddress = walletStore.activeAddress || undefined;
        analyticsStore.trackFeature(feature, details, walletAddress);
    }

    /**
     * Track error
     */
    function trackError(
        error: Error | string,
        context?: Record<string, unknown>,
    ): void {
        const walletAddress = walletStore.activeAddress || undefined;
        analyticsStore.trackError(error, context, walletAddress);
    }

    /**
     * Track chat message
     */
    function trackChatMessage(): void {
        const walletAddress = walletStore.activeAddress || undefined;
        analyticsStore.trackChatMessage(walletAddress);
    }

    /**
     * Track chat session creation
     */
    function trackChatSessionCreated(): void {
        const walletAddress = walletStore.activeAddress || undefined;
        analyticsStore.trackChatSessionCreated(walletAddress);
    }

    return {
        track,
        trackPageView,
        trackWalletConnect,
        trackWalletDisconnect,
        trackTransaction,
        trackFeature,
        trackError,
        trackChatMessage,
        trackChatSessionCreated,
    };
}
