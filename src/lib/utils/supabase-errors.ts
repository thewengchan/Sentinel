/**
 * Supabase Error Handling Utilities
 * Provides user-friendly error messages and error detection
 */

import { toast } from "svelte-sonner";

/**
 * Error message constants
 */
export const ERROR_MESSAGES = {
    NETWORK_ERROR:
        "Unable to connect to server. Please check your internet connection.",
    AUTH_REQUIRED: "Please connect your wallet to continue.",
    ACCESS_DENIED: "You do not have permission to access this data.",
    NOT_FOUND: "The requested item was not found.",
    ALREADY_EXISTS: "This item already exists.",
    VALIDATION_ERROR: "Please check your input and try again.",
    SERVER_ERROR: "Something went wrong on our end. Please try again later.",
    UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
} as const;

/**
 * Convert Supabase errors to user-friendly messages
 */
export function handleSupabaseError(error: any): string {
    if (!error) return ERROR_MESSAGES.UNKNOWN_ERROR;

    // Network/connectivity errors
    if (isNetworkError(error)) {
        return ERROR_MESSAGES.NETWORK_ERROR;
    }

    // Authentication errors
    if (error?.code === "PGRST301" || error?.message?.includes("JWT")) {
        return ERROR_MESSAGES.AUTH_REQUIRED;
    }

    // RLS/Access errors
    if (error?.message?.includes("RLS") || error?.code === "42501") {
        return ERROR_MESSAGES.ACCESS_DENIED;
    }

    // Not found errors
    if (error?.code === "PGRST116" || error?.message?.includes("not found")) {
        return ERROR_MESSAGES.NOT_FOUND;
    }

    // Constraint violations
    if (error?.code === "23505") {
        return ERROR_MESSAGES.ALREADY_EXISTS;
    }

    // Foreign key violations
    if (error?.code === "23503") {
        return ERROR_MESSAGES.NOT_FOUND;
    }

    // Validation errors
    if (
        error?.code === "23514" || error?.message?.includes("check constraint")
    ) {
        return ERROR_MESSAGES.VALIDATION_ERROR;
    }

    // Server errors
    if (error?.code?.startsWith("5") || error?.status >= 500) {
        return ERROR_MESSAGES.SERVER_ERROR;
    }

    // Return the original message if it's user-friendly, otherwise generic message
    if (error?.message && isUserFriendlyMessage(error.message)) {
        return error.message;
    }

    return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Check if error is a network/connectivity issue
 */
export function isNetworkError(error: any): boolean {
    if (!error) return false;

    const networkIndicators = [
        "network",
        "fetch",
        "timeout",
        "connection",
        "offline",
        "NETWORK_ERROR",
        "ECONNREFUSED",
        "ENOTFOUND",
        "ETIMEDOUT",
    ];

    const errorMessage = error?.message?.toLowerCase() || "";
    const errorCode = error?.code?.toLowerCase() || "";

    return networkIndicators.some((indicator) =>
        errorMessage.includes(indicator) || errorCode.includes(indicator)
    );
}

/**
 * Check if error message is user-friendly (not technical)
 */
function isUserFriendlyMessage(message: string): boolean {
    const technicalTerms = [
        "sql",
        "database",
        "query",
        "constraint",
        "violation",
        "foreign key",
        "primary key",
        "index",
        "table",
        "column",
        "row",
        "pg_",
        "pgrst",
        "postgres",
        "supabase",
    ];

    const lowerMessage = message.toLowerCase();
    return !technicalTerms.some((term) => lowerMessage.includes(term));
}

/**
 * Determine if an operation should be retried
 */
export function shouldRetry(error: any): boolean {
    if (!error) return false;

    // Retry network errors
    if (isNetworkError(error)) return true;

    // Retry temporary server errors
    if (error?.code === "PGRST301" || error?.status === 503) return true;

    // Don't retry client errors (4xx) except for specific cases
    if (error?.status >= 400 && error?.status < 500) {
        return error?.status === 408 || error?.status === 429; // timeout or rate limit
    }

    return false;
}

/**
 * Show error toast with appropriate styling
 */
export function showErrorToast(error: any, context?: string): void {
    const message = handleSupabaseError(error);
    const fullMessage = context ? `${context}: ${message}` : message;

    toast.error(fullMessage, {
        duration: isNetworkError(error) ? 8000 : 5000, // Longer duration for network errors
    });
}

/**
 * Show success toast
 */
export function showSuccessToast(message: string): void {
    toast.success(message);
}

/**
 * Show info toast
 */
export function showInfoToast(message: string): void {
    toast.info(message);
}

/**
 * Show warning toast
 */
export function showWarningToast(message: string): void {
    toast.warning(message);
}

/**
 * Handle async operation with error handling
 */
export async function handleAsyncOperation<T>(
    operation: () => Promise<T>,
    context?: string,
    showToast: boolean = true,
): Promise<T | null> {
    try {
        return await operation();
    } catch (error) {
        console.error(`Error in ${context || "async operation"}:`, error);

        if (showToast) {
            showErrorToast(error, context);
        }

        return null;
    }
}

/**
 * Retry operation with exponential backoff
 */
export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    context?: string,
): Promise<T | null> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            if (attempt === maxRetries || !shouldRetry(error)) {
                break;
            }

            const delay = baseDelay * Math.pow(2, attempt);
            console.log(
                `Retrying ${context || "operation"} in ${delay}ms (attempt ${
                    attempt + 1
                }/${maxRetries + 1})`,
            );

            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    console.error(
        `Failed ${context || "operation"} after ${maxRetries + 1} attempts:`,
        lastError,
    );
    showErrorToast(lastError, context);

    return null;
}
