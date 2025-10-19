/**
 * Chat Store - Manages chat sessions and messages
 * Uses Svelte 5 runes for reactive state management
 */

import { Storage, StorageKeys } from "$lib/utils/storage";
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
}

class ChatStore {
    private state = $state<ChatState>({
        currentSession: null,
        sessions: [],
        isLoading: false,
        moderationResults: new Map(),
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

    /**
     * Initialize store by loading sessions from localStorage
     */
    init(): void {
        this.loadSessions();
    }

    /**
     * Load all sessions from localStorage
     */
    private loadSessions(): void {
        const sessions = Storage.get<ChatSession[]>(
            StorageKeys.CHAT_SESSIONS,
            [],
        );
        this.state.sessions = sessions.sort((a, b) =>
            b.updatedAt - a.updatedAt
        );

        // Load current session if exists
        const currentSessionId = Storage.get<string | null>(
            StorageKeys.CHAT_CURRENT_SESSION,
            null,
        );
        if (currentSessionId) {
            const currentSession = sessions.find((s) =>
                s.id === currentSessionId
            );
            if (currentSession) {
                this.state.currentSession = currentSession;
            }
        }
    }

    /**
     * Save sessions to localStorage
     */
    private saveSessions(): void {
        Storage.set(StorageKeys.CHAT_SESSIONS, this.state.sessions);
    }

    /**
     * Save current session ID
     */
    private saveCurrentSessionId(): void {
        Storage.set(
            StorageKeys.CHAT_CURRENT_SESSION,
            this.state.currentSession?.id || null,
        );
    }

    /**
     * Create a new chat session
     */
    createSession(title?: string): ChatSession {
        const session: ChatSession = {
            id: crypto.randomUUID(),
            title: title || "New conversation",
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messageCount: 0,
            isBlocked: false,
        };

        this.state.sessions = [session, ...this.state.sessions];
        this.state.currentSession = session;
        this.clearModerationResults(); // Clear moderation results for new session
        this.saveSessions();
        this.saveCurrentSessionId();

        return session;
    }

    /**
     * Load a session by ID
     */
    loadSession(sessionId: string): void {
        const session = this.state.sessions.find((s) => s.id === sessionId);
        if (session) {
            this.state.currentSession = session;
            this.saveCurrentSessionId();
        }
    }

    /**
     * Add a message to the current session
     */
    addMessage(
        role: "user" | "assistant" | "system",
        content: string,
        messageId?: string,
    ): ChatMessage {
        if (!this.state.currentSession) {
            // Auto-create session if none exists
            this.createSession();
        }

        const message: ChatMessage = {
            role,
            content,
            timestamp: Date.now(),
            id: messageId || crypto.randomUUID(),
        };

        if (this.state.currentSession) {
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
                this.state.currentSession.title = this.generateTitle(content);
            }

            // Update session in sessions list
            this.updateSessionInList(this.state.currentSession);
            this.saveSessions();
        }

        return message;
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
    deleteSession(sessionId: string): void {
        this.state.sessions = this.state.sessions.filter((s) =>
            s.id !== sessionId
        );

        if (this.state.currentSession?.id === sessionId) {
            this.state.currentSession = this.state.sessions[0] || null;
            this.saveCurrentSessionId();
        }

        this.saveSessions();
    }

    /**
     * Update session title
     */
    updateSessionTitle(sessionId: string, title: string): void {
        const session = this.state.sessions.find((s) => s.id === sessionId);
        if (session) {
            session.title = title;
            if (this.state.currentSession?.id === sessionId) {
                this.state.currentSession.title = title;
            }
            this.saveSessions();
        }
    }

    /**
     * Clear current session
     */
    clearCurrentSession(): void {
        this.state.currentSession = null;
        Storage.remove(StorageKeys.CHAT_CURRENT_SESSION);
    }

    /**
     * Clear all sessions
     */
    clearAllSessions(): void {
        this.state.sessions = [];
        this.state.currentSession = null;
        Storage.remove(StorageKeys.CHAT_SESSIONS);
        Storage.remove(StorageKeys.CHAT_CURRENT_SESSION);
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
        const newMap = new Map(this.state.moderationResults);
        newMap.set(messageId, result);
        this.state.moderationResults = newMap;

        // If blocked, mark session as blocked
        if (result.action === "block" && !result.allowed) {
            if (this.state.currentSession) {
                this.state.currentSession.isBlocked = true;
                this.updateSessionInList(this.state.currentSession);
                this.saveSessions();
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
            this.saveSessions();
        }
    }
}

// Export singleton instance
export const chatStore = new ChatStore();
