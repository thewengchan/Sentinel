import { json, type RequestHandler } from "@sveltejs/kit";
import { getIncident } from "$lib/supabase/incidents";

export const GET: RequestHandler = async ({ params, locals: { supabase } }) => {
    try {
        const { id } = params;

        if (!id) {
            return json({ error: "Incident ID required" }, { status: 400 });
        }

        const incident = await getIncident(supabase, id);

        return json(incident);
    } catch (error) {
        console.error("Error fetching incident:", error);
        return json(
            {
                error: error instanceof Error
                    ? error.message
                    : "Failed to fetch incident",
            },
            { status: 500 },
        );
    }
};
