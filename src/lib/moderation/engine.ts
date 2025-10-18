// src/lib/moderation/engine.ts
import { OpenAI } from "openai";
import crypto from "crypto";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export function sha256Hex(s: string) {
    return "0x" + crypto.createHash("sha256").update(s, "utf8").digest("hex");
}

type ModResult = {
    flagged: boolean;
    category: string; // e.g. 'self_harm', 'hate'
    severity: 0 | 1 | 2 | 3;
};

export async function moderate(text: string): Promise<ModResult> {
    console.log("🤖 Calling OpenAI Moderation API...");

    const res = await openai.moderations.create({
        model: "omni-moderation-latest",
        input: text,
    });

    // Map OpenAI categories → your category + severity
    const r = res.results?.[0];

    // Log raw OpenAI response
    console.log("📊 OpenAI Moderation Response:", {
        flagged: r?.flagged,
        categories: r?.categories,
        categoryScores: r?.category_scores,
    });

    if (!r) return { flagged: false, category: "unknown", severity: 0 };

    // example mapping (tune as needed)
    const cats = r.categories ?? {};
    let mappedResult: ModResult;

    if (r.flagged) {
        if (cats["self-harm"] || cats["self-harm/instructions"]) {
            mappedResult = {
                flagged: true,
                category: "self_harm",
                severity: 3,
            };
        } else if (cats["sexual/minors"]) {
            mappedResult = {
                flagged: true,
                category: "sexual_minors",
                severity: 3,
            };
        } else if (cats["hate"] || cats["hate/threatening"]) {
            mappedResult = { flagged: true, category: "hate", severity: 2 };
        } else if (cats["violence"] || cats["violence/graphic"]) {
            mappedResult = { flagged: true, category: "violence", severity: 2 };
        } else if (cats["sexual"]) {
            mappedResult = { flagged: true, category: "sexual", severity: 2 };
        } else if (cats["harassment"] || cats["harassment/threatening"]) {
            mappedResult = {
                flagged: true,
                category: "harassment",
                severity: 2,
            };
        } else {
            mappedResult = { flagged: true, category: "other", severity: 1 };
        }
    } else {
        mappedResult = { flagged: false, category: "clean", severity: 0 };
    }

    console.log("✅ Mapped Result:", mappedResult);
    return mappedResult;
}
