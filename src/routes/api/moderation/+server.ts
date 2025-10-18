import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async () => {
    const moderation = await openai.moderations.create({
        model: "omni-moderation-latest",
        input: "...text to classify goes here...",
    });

    console.log(moderation);
    return new Response(JSON.stringify(moderation));
};

import OpenAI from "openai";
const openai = new OpenAI();
