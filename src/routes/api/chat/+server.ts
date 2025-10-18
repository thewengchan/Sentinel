import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { OPENAI_API_KEY } from "$env/static/private";

const openai = createOpenAI({
	apiKey: OPENAI_API_KEY,
});

export async function POST({ request }: { request: Request }) {
	const { messages }: { messages: UIMessage[] } = await request.json();

	const result = streamText({
		model: openai("o4-mini"),
		messages: convertToModelMessages(messages),
	});

	return result.toUIMessageStreamResponse();
}
