import { buildInterviewChain } from "@/lib/chains/interviewPrep";
import { IsCollectionExists } from "@/lib/chroma";
import { NextResponse } from "next/server";
import { z } from "zod";
export async function POST(req: Request) {
    try {
        const bodySchema = z.object({
            sessionId: z.string().uuid(),
            jdText: z.string().min(10),
        });
        const request = await req.json();
        const body = bodySchema.safeParse(request);
        if (!body.success) {
            return NextResponse.json(body.error, { status: 422 });
        }
        const { sessionId, jdText } = request;
        if (!(await IsCollectionExists(sessionId))) {
            return NextResponse.json(
                {
                    error: "Session expired - please re-upload your resume",
                },
                { status: 404 },
            );
        }

        const chain = buildInterviewChain(sessionId);
        const interviewQuestions = await chain.invoke({ jdText });

        return NextResponse.json({ interviewQuestions });
    } catch (e) {
        console.error("Interview error:", e);
        return NextResponse.json(
            { error: "Failed to generate interview questions" },
            { status: 500 },
        );
    }
}
