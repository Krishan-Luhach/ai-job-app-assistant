import { buildChatChain } from "@/lib/chains/chat";
import { IsCollectionExists } from "@/lib/chroma";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { sessionId, input, chat_history } = await req.json();

        if (!sessionId || !input) {
            return NextResponse.json(
                { error: "sessionId and input are required" },
                { status: 400 },
            );
        }

        if (!(await IsCollectionExists(sessionId))) {
            return NextResponse.json(
                {
                    error: "Session expired - please re-upload your resume",
                },
                { status: 404 },
            );
        }
        const chain = buildChatChain(sessionId);

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of await chain.stream({
                        input,
                        chat_history,
                        sessionId,
                    })) {
                        /* "data: " prefix and \n\n ending are SSE format - browser EventSource API recognize this format */
                        controller.enqueue(encoder.encode(`data:${chunk}\n\n`)); 
                    }
                } catch (err) {
                    controller.enqueue(
                        encoder.encode(`data: [ERROR] ${String(err)}\n\n`),
                    );
                } finally {
                    controller.close();
                }
            },
        });
        return new Response(stream, {
            headers: { "Content-Type": "text/event-stream" }
        });
    } catch (e) {
        console.error("Chat error:", e);
        return NextResponse.json(
            { error: "Failed to process chat request" },
            { status: 500 },
        );
    }
}
