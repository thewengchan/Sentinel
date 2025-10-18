// src/lib/algorand/incidents.ts
import { algoClient, signAndSendSelfNoteTx } from "$lib/algorand/client";
// ^ assume you expose a signer that creates a 0-ALGO self-payment with note

type ChainIncident = {
    incidentId: string;
    wallet?: string | null;
    ts: number;
    contentHashHex: string; // 0x...
    severity: number;
    category: string;
    policyVersion: string;
};

export async function submitIncidentToChain(
    payload: ChainIncident,
): Promise<string> {
    // Keep the note <= ~1KB
    const note = {
        dapp: "Sentinel",
        kind: "incident",
        incidentId: payload.incidentId,
        wallet: payload.wallet ?? null,
        ts: payload.ts,
        h: payload.contentHashHex,
        sev: payload.severity,
        cat: payload.category,
        pv: payload.policyVersion,
    };
    return await signAndSendSelfNoteTx(note); // returns txId
}
