import { json, type RequestHandler } from "@sveltejs/kit";
import { updateIncidentStatus } from "$lib/supabase/incidents";

interface UpdateStatusRequest {
    chain_status: "pending" | "submitted" | "confirmed" | "failed";
    tx_id?: string;
}

export const PATCH: RequestHandler = async (
    { params, request, locals: { supabase } },
) => {
    try {
        const { id } = params;

        if (!id) {
            return json({ error: "Incident ID required" }, { status: 400 });
        }

        const { chain_status, tx_id }: UpdateStatusRequest = await request
            .json();

        if (!chain_status) {
            return json({ error: "chain_status required" }, { status: 400 });
        }

        await updateIncidentStatus(supabase, id, chain_status, tx_id);

        return json({ success: true });
    } catch (error) {
        console.error("Error updating incident status:", error);
        return json(
            {
                error: error instanceof Error
                    ? error.message
                    : "Failed to update incident status",
            },
            { status: 500 },
        );
    }
};
