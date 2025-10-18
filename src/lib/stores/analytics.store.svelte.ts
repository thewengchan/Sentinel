/**
 * Analytics Store - Tracks user events and analytics
 * Uses Svelte 5 runes for reactive state management
 */

import { browser } from "$app/environment";
import { StorageKeys } from "$lib/utils/storage";

export type AnalyticsEventType =
    | "page_view"
    | "wallet_connect"
    | "wallet_disconnect"
    | "transaction_initiated"
    | "transaction_completed"
    | "transaction_failed"
    | "feature_used"
    | "error_occurred"
    | "chat_message_sent"
    | "chat_session_created";

export interface AnalyticsEvent {
    id: string;
    type: AnalyticsEventType;
    timestamp: number;
    sessionId: string;
    walletAddress?: string;
    data?: Record<string, unknown>;
}

interface AnalyticsState {
    events: AnalyticsEvent[];
    sessionId: string;
    isEnabled: boolean;
}

class AnalyticsStore {
    private state = $state<AnalyticsState>({
        events: [],
        sessionId: this.getOrCreateSessionId(),
        isEnabled: true,
    });

    private eventQueue: AnalyticsEvent[] = [];
    private flushInterval: ReturnType<typeof setInterval> | null = null;

    // Getters
    get events() {
        return this.state.events;
    }

    get sessionId() {
        return this.state.sessionId;
    }

    get isEnabled() {
        return this.state.isEnabled;
    }

    /**
     * Get or create a session ID
     */
    private getOrCreateSessionId(): string {
        if (!browser) return "server";

        let sessionId = sessionStorage.getItem(
            StorageKeys.ANALYTICS_SESSION_ID,
        );
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            sessionStorage.setItem(StorageKeys.ANALYTICS_SESSION_ID, sessionId);
        }
        return sessionId;
    }

    /**
     * Initialize analytics
     */
    init(): void {
        if (!browser) return;

        // Start auto-flush every 30 seconds
        this.startAutoFlush();

        // Flush on page unload
        window.addEventListener("beforeunload", () => {
            this.flush();
        });
    }

    /**
     * Track an event
     */
    track(
        type: AnalyticsEventType,
        data?: Record<string, unknown>,
        walletAddress?: string,
    ): void {
        if (!this.state.isEnabled) return;

        const event: AnalyticsEvent = {
            id: crypto.randomUUID(),
            type,
            timestamp: Date.now(),
            sessionId: this.state.sessionId,
            walletAddress,
            data,
        };

        this.state.events = [...this.state.events, event];
        this.eventQueue.push(event);

        // Log to console in development
        if (browser && import.meta.env.DEV) {
            console.log("📊 Analytics Event:", {
                type,
                data,
                walletAddress,
                sessionId: this.state.sessionId,
            });
        }
    }

    /**
     * Track page view
     */
    trackPageView(path: string, referrer?: string): void {
        this.track("page_view", {
            path,
            referrer: referrer || document.referrer,
            userAgent: navigator.userAgent,
        });
    }

    /**
     * Track wallet connection
     */
    trackWalletConnect(
        walletType: string,
        walletAddress: string,
        network: string,
    ): void {
        this.track(
            "wallet_connect",
            {
                walletType,
                network,
            },
            walletAddress,
        );
    }

    /**
     * Track wallet disconnection
     */
    trackWalletDisconnect(walletAddress: string): void {
        this.track("wallet_disconnect", {}, walletAddress);
    }

    /**
     * Track transaction
     */
    trackTransaction(
        status: "initiated" | "completed" | "failed",
        transactionData: Record<string, unknown>,
        walletAddress?: string,
    ): void {
        const eventType = status === "initiated"
            ? "transaction_initiated"
            : status === "completed"
            ? "transaction_completed"
            : "transaction_failed";

        this.track(eventType, transactionData, walletAddress);
    }

    /**
     * Track feature usage
     */
    trackFeature(
        feature: string,
        details?: Record<string, unknown>,
        walletAddress?: string,
    ): void {
        this.track(
            "feature_used",
            {
                feature,
                ...details,
            },
            walletAddress,
        );
    }

    /**
     * Track error
     */
    trackError(
        error: Error | string,
        context?: Record<string, unknown>,
        walletAddress?: string,
    ): void {
        const errorMessage = error instanceof Error ? error.message : error;
        const errorStack = error instanceof Error ? error.stack : undefined;

        this.track(
            "error_occurred",
            {
                message: errorMessage,
                stack: errorStack,
                ...context,
            },
            walletAddress,
        );
    }

    /**
     * Track chat events
     */
    trackChatMessage(walletAddress?: string): void {
        this.track("chat_message_sent", {}, walletAddress);
    }

    trackChatSessionCreated(walletAddress?: string): void {
        this.track("chat_session_created", {}, walletAddress);
    }

    /**
     * Flush events (send to backend/log)
     */
    flush(): void {
        if (this.eventQueue.length === 0) return;

        // In future, send to Supabase
        // For now, just log in development
        if (browser && import.meta.env.DEV) {
            console.log(
                "📊 Flushing analytics events:",
                this.eventQueue.length,
            );
        }

        // Clear the queue
        this.eventQueue = [];
    }

    /**
     * Start auto-flush interval
     */
    private startAutoFlush(intervalMs: number = 30000): void {
        if (this.flushInterval) return;

        this.flushInterval = setInterval(() => {
            this.flush();
        }, intervalMs);
    }

    /**
     * Stop auto-flush
     */
    stopAutoFlush(): void {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
            this.flushInterval = null;
        }
    }

    /**
     * Enable analytics
     */
    enable(): void {
        this.state.isEnabled = true;
    }

    /**
     * Disable analytics
     */
    disable(): void {
        this.state.isEnabled = false;
    }

    /**
     * Get events by type
     */
    getEventsByType(type: AnalyticsEventType): AnalyticsEvent[] {
        return this.state.events.filter((event) => event.type === type);
    }

    /**
     * Get events by wallet address
     */
    getEventsByWallet(walletAddress: string): AnalyticsEvent[] {
        return this.state.events.filter((event) =>
            event.walletAddress === walletAddress
        );
    }

    /**
     * Get event count
     */
    get eventCount(): number {
        return this.state.events.length;
    }

    /**
     * Clear all events
     */
    clear(): void {
        this.state.events = [];
        this.eventQueue = [];
    }
}

// Export singleton instance
export const analyticsStore = new AnalyticsStore();
