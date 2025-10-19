/**
 * Chat Store - Manages chat sessions and messages
 * Uses Svelte 5 runes for reactive state management
 * Migrated from localStorage to Supabase
 */

import { showErrorToast } from "$lib/utils/supabase-errors";
import type { UIMessage } from "ai";
import { SvelteMap } from "svelte/reactivity";

export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: number;
    id?: string; // Unique message ID for tracking moderation
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
    messageCount: number;
    isBlocked?: boolean; // Track if conversation is blocked
}

export interface ModerationResult {
    allowed: boolean;
    action: "allow" | "block";
    reason?: string;
    severity?: number;
    category?: string;
    pending?: boolean; // True while moderation in progress
}

interface ChatState {
    currentSession: ChatSession | null;
    sessions: ChatSession[];
    isLoading: boolean;
    moderationResults: Map<string, ModerationResult>; // messageId -> result
    // Supabase integration
    userId: string | null;
    walletAddress: string | null;
    error: string | null;
}

class ChatStore {
    private state = $state<ChatState>({
        currentSession: null,
        sessions: [],
        isLoading: false,
        moderationResults: new Map(),
        // Supabase integration
        userId: null,
        walletAddress: null,
        error: null,
    });

    // Getters
    get currentSession() {
        return this.state.currentSession;
    }

    get sessions() {
        return this.state.sessions;
    }

    get currentMessages() {
        return this.state.currentSession?.messages || [];
    }

    get isLoading() {
        return this.state.isLoading;
    }

    get isBlocked() {
        return this.state.currentSession?.isBlocked || false;
    }

    get userId() {
        return this.state.userId;
    }

    get walletAddress() {
        return this.state.walletAddress;
    }

    get error() {
        return this.state.error;
    }

    /**
     * Initialize store with user context and load sessions from Supabase
     */
    async init(userId: string, walletAddress: string): Promise<void> {
        this.state.userId = userId;
        this.state.walletAddress = walletAddress;
        this.state.error = null;
        await this.loadSessions();
    }

    /**
     * Load all sessions from Supabase
     */
    private async loadSessions(): Promise<void> {
        if (!this.state.userId || !this.state.walletAddress) {
            console.warn(
                "Cannot load sessions: missing userId or walletAddress",
            );
            return;
        }

        this.state.isLoading = true;
        this.state.error = null;

        try {
            const response = await fetch("/api/chat/sessions", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to load chat sessions");
            }

            const result = await response.json();

            if (result.success) {
                this.state.sessions = result.sessions || [];
            } else {
                throw new Error(result.error || "Failed to load sessions");
            }
        } catch (error) {
            console.error("Failed to load chat sessions:", error);
            this.state.error = error instanceof Error
                ? error.message
                : "Failed to load sessions";
            this.state.sessions = [];
            showErrorToast(error, "Failed to load chat sessions");
        } finally {
            this.state.isLoading = false;
        }
    }

    // Removed localStorage save methods - no longer needed with Supabase

    /**
     * Create a new chat session
     */
    async createSession(title?: string): Promise<ChatSession | null> {
        if (!this.state.userId || !this.state.walletAddress) {
            console.warn(
                "Cannot create session: missing userId or walletAddress",
            );
            return null;
        }

        this.state.isLoading = true;
        this.state.error = null;

        try {
            const response = await fetch("/api/chat/sessions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title || "New conversation",
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create chat session");
            }

            const result = await response.json();

            if (result.success && result.session) {
                const session: ChatSession = {
                    id: result.session.id,
                    title: result.session.title,
                    messages: [],
                    createdAt: new Date(result.session.created_at).getTime(),
                    updatedAt: new Date(result.session.updated_at).getTime(),
                    messageCount: 0,
                    isBlocked: false,
                };

                this.state.sessions = [session, ...this.state.sessions];
                this.state.currentSession = session;
                this.clearModerationResults(); // Clear moderation results for new session

                return session;
            } else {
                throw new Error(result.error || "Failed to create session");
            }
        } catch (error) {
            console.error("Failed to create chat session:", error);
            this.state.error = error instanceof Error
                ? error.message
                : "Failed to create session";
            showErrorToast(error, "Failed to create chat session");
            return null;
        } finally {
            this.state.isLoading = false;
        }
    }

    /**
     * Load a session by ID
     */
    async loadSession(sessionId: string): Promise<void> {
        if (!this.state.userId || !this.state.walletAddress) {
            console.warn(
                "Cannot load session: missing userId or walletAddress",
            );
            return;
        }

        this.state.isLoading = true;
        this.state.error = null;

        try {
            const response = await fetch(`/api/chat/sessions/${sessionId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to load chat session");
            }

            const result = await response.json();

            if (result.success && result.session) {
                const session: ChatSession = {
                    id: result.session.id,
                    title: result.session.title,
                    messages: result.messages || [],
                    createdAt: new Date(result.session.created_at).getTime(),
                    updatedAt: new Date(result.session.updated_at).getTime(),
                    messageCount: result.session.message_count || 0,
                    isBlocked: false,
                };

                this.state.currentSession = session;

                // Update session in sessions list if it exists
                const sessionIndex = this.state.sessions.findIndex((s) =>
                    s.id === sessionId
                );
                if (sessionIndex !== -1) {
                    this.state.sessions[sessionIndex] = session;
                }
            } else {
                throw new Error(result.error || "Failed to load session");
            }
        } catch (error) {
            console.error("Failed to load chat session:", error);
            this.state.error = error instanceof Error
                ? error.message
                : "Failed to load session";
            showErrorToast(error, "Failed to load chat session");
        } finally {
            this.state.isLoading = false;
        }
    }

    /**
     * Add a message to the current session
     */
    async addMessage(
        role: "user" | "assistant" | "system",
        content: string,
        messageId?: string,
    ): Promise<ChatMessage | null> {
        if (!this.state.currentSession) {
            // Auto-create session if none exists
            const newSession = await this.createSession();
            if (!newSession) {
                return null;
            }
        }

        if (!this.state.currentSession) {
            console.error("Failed to create or get current session");
            return null;
        }

        const message: ChatMessage = {
            role,
            content,
            timestamp: Date.now(),
            id: messageId || crypto.randomUUID(),
        };

        try {
            const response = await fetch("/api/chat/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    session_id: this.state.currentSession.id,
                    role,
                    content,
                    message_id: message.id,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save message");
            }

            const result = await response.json();

            if (result.success) {
                // Add message to current session
                this.state.currentSession.messages = [
                    ...this.state.currentSession.messages,
                    message,
                ];
                this.state.currentSession.messageCount =
                    this.state.currentSession.messages.length;
                this.state.currentSession.updatedAt = Date.now();

                // Auto-generate title from first user message
                if (
                    this.state.currentSession.title === "New conversation" &&
                    role === "user" &&
                    this.state.currentSession.messageCount === 1
                ) {
                    this.state.currentSession.title = this.generateTitle(
                        content,
                    );
                    // Update session title in database
                    await this.updateSessionTitle(
                        this.state.currentSession.id,
                        this.state.currentSession.title,
                    );
                }

                // Update session in sessions list
                this.updateSessionInList(this.state.currentSession);

                return message;
            } else {
                throw new Error(result.error || "Failed to save message");
            }
        } catch (error) {
            console.error("Failed to add message:", error);
            showErrorToast(error, "Failed to save message");
            return null;
        }
    }

    /**
     * Update session in the sessions list
     */
    private updateSessionInList(session: ChatSession): void {
        const index = this.state.sessions.findIndex((s) => s.id === session.id);
        if (index !== -1) {
            this.state.sessions[index] = session;
            // Re-sort sessions by updated time
            this.state.sessions = [...this.state.sessions].sort((a, b) =>
                b.updatedAt - a.updatedAt
            );
        }
    }

    /**
     * Generate a title from the first message
     */
    private generateTitle(content: string): string {
        const maxLength = 50;
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + "...";
    }

    /**
     * Delete a session
     */
    async deleteSession(sessionId: string): Promise<void> {
        if (!this.state.userId || !this.state.walletAddress) {
            console.warn(
                "Cannot delete session: missing userId or walletAddress",
            );
            return;
        }

        try {
            const response = await fetch(`/api/chat/sessions/${sessionId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete session");
            }

            const result = await response.json();

            if (result.success) {
                // Remove from local state
                this.state.sessions = this.state.sessions.filter((s) =>
                    s.id !== sessionId
                );

                if (this.state.currentSession?.id === sessionId) {
                    this.state.currentSession = this.state.sessions[0] || null;
                }
            } else {
                throw new Error(result.error || "Failed to delete session");
            }
        } catch (error) {
            console.error("Failed to delete session:", error);
            showErrorToast(error, "Failed to delete session");
        }
    }

    /**
     * Update session title
     */
    async updateSessionTitle(sessionId: string, title: string): Promise<void> {
        if (!this.state.userId || !this.state.walletAddress) {
            console.warn(
                "Cannot update session title: missing userId or walletAddress",
            );
            return;
        }

        try {
            const response = await fetch(`/api/chat/sessions/${sessionId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update session title");
            }

            const result = await response.json();

            if (result.success) {
                // Update local state
                const session = this.state.sessions.find((s) =>
                    s.id === sessionId
                );
                if (session) {
                    session.title = title;
                    if (this.state.currentSession?.id === sessionId) {
                        this.state.currentSession.title = title;
                    }
                }
            } else {
                throw new Error(
                    result.error || "Failed to update session title",
                );
            }
        } catch (error) {
            console.error("Failed to update session title:", error);
            showErrorToast(error, "Failed to update session title");
        }
    }

    /**
     * Clear current session
     */
    clearCurrentSession(): void {
        this.state.currentSession = null;
    }

    /**
     * Clear all sessions
     */
    clearAllSessions(): void {
        this.state.sessions = [];
        this.state.currentSession = null;
    }

    /**
     * Convert ChatMessage to AI SDK UIMessage format
     */
    toUIMessages(messages: ChatMessage[]): UIMessage[] {
        return messages.map((msg, index) => ({
            id: `msg-${msg.timestamp}-${index}`,
            role: msg.role,
            parts: [{ type: "text" as const, text: msg.content }],
        }));
    }

    /**
     * Convert AI SDK UIMessage to ChatMessage format
     */
    fromUIMessage(uiMessage: UIMessage): ChatMessage {
        const content = uiMessage.parts
            .filter((part) => part.type === "text")
            .map((part) => (part as { type: "text"; text: string }).text)
            .join("") || "";

        return {
            role: uiMessage.role as "user" | "assistant" | "system",
            content,
            timestamp: Date.now(),
        };
    }

    /**
     * Get session count
     */
    get sessionCount(): number {
        return this.state.sessions.length;
    }

    /**
     * Set moderation result for a message
     */
    setModerationResult(messageId: string, result: ModerationResult): void {
        // Create new Map to trigger reactivity in Svelte 5
        const newMap = new SvelteMap(this.state.moderationResults);
        newMap.set(messageId, result);
        this.state.moderationResults = newMap;

        // If blocked, mark session as blocked
        if (result.action === "block" && !result.allowed) {
            if (this.state.currentSession) {
                this.state.currentSession.isBlocked = true;
                this.updateSessionInList(this.state.currentSession);
            }
        }
    }

    /**
     * Get moderation result for a message
     */
    getModerationResult(messageId: string): ModerationResult | undefined {
        return this.state.moderationResults.get(messageId);
    }

    /**
     * Set pending moderation for a message
     */
    setPendingModeration(messageId: string): void {
        // Create new Map to trigger reactivity in Svelte 5
        const newMap = new SvelteMap(this.state.moderationResults);
        newMap.set(messageId, {
            allowed: true,
            action: "allow",
            pending: true,
        });
        this.state.moderationResults = newMap;
    }

    /**
     * Clear moderation results (useful when starting new session)
     */
    clearModerationResults(): void {
        // Create new empty Map to trigger reactivity in Svelte 5
        this.state.moderationResults = new Map();
    }

    /**
     * Unblock current session (for testing or manual override)
     */
    unblockSession(): void {
        if (this.state.currentSession) {
            this.state.currentSession.isBlocked = false;
            this.updateSessionInList(this.state.currentSession);
        }
    }
}

// Export singleton instance
export const chatStore = new ChatStore();
