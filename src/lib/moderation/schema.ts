// src/lib/moderation/schemas.ts
import { z } from "zod";

export const ModerateRequest = z.object({
    sessionId: z.string().uuid(),
    messageId: z.string().min(1), // from your chat layer
    from: z.enum(["user", "ai"]),
    text: z.string().min(1),
    wallet: z.string().optional(), // algorand addr if known
    policyVersion: z.string().default("v1"), // pin which policy made the call
});

export type ModerateRequest = z.infer<typeof ModerateRequest>;

export const ModerateResponse = z.object({
    allowed: z.boolean(),
    action: z.enum(["allow", "block"]).default("allow"),
    reason: z.string().optional(),
    severity: z.number().int().min(0).max(3).optional(),
    category: z.string().optional(),
    incidentId: z.string().uuid().optional(),
    txId: z.string().optional(),
    chainStatus: z.enum(["pending", "submitted", "confirmed", "failed"])
        .optional(),
});

export type ModerateResponse = z.infer<typeof ModerateResponse>;
