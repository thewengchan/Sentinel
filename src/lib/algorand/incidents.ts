// src/lib/algorand/incidents.ts
// NOTE: This file is currently disabled as it needs to be updated for the new AlgoKit client
// TODO: Implement signAndSendSelfNoteTx using the new AlgorandClient

// import { testnetClient } from "$lib/algorand/client";
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
    // TODO: Implement transaction signing with the new AlgoKit client
    // This will require integration with the wallet manager for signing

    // Keep the note <= ~1KB (for future implementation)
    // const note = {
    //     dapp: "Sentinel",
    //     kind: "incident",
    //     incidentId: payload.incidentId,
    //     wallet: payload.wallet ?? null,
    //     ts: payload.ts,
    //     h: payload.contentHashHex,
    //     sev: payload.severity,
    //     cat: payload.category,
    //     pv: payload.policyVersion,
    // };

    throw new Error(
        `submitIncidentToChain not yet implemented for AlgoKit client. Payload: ${
            JSON.stringify(payload)
        }`,
    );

    // return await signAndSendSelfNoteTx(note); // returns txId
}
