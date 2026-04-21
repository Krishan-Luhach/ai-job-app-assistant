import { buildCoverLetterChain } from "@/lib/chains/coverLetter";
import { skillGapChain } from "@/lib/chains/skillGap";
import { IsCollectionExists } from "@/lib/chroma";
import { SkillGapResult } from "@/lib/types";
import { NextResponse } from "next/server";
import { z } from "zod";
export async function POST(req: Request) {
    try {
        const bodySchema = z.object({
            sessionId: z.string().uuid(),
            jdText: z.string().min(10),
            resumeText: z.string().min(100),
        });
        const request = await req.json();
        const body = bodySchema.safeParse(request);
        if (!body.success) {
            return NextResponse.json(body.error, { status: 422 });
        }
        const { sessionId, resumeText, jdText } = request;
        if (!(await IsCollectionExists(sessionId))) {
            return NextResponse.json(
                {
                    error: "Session expired - please re-upload your resume",
                },
                { status: 404 },
            );
        }
        const analysis: SkillGapResult = await skillGapChain.invoke({
            resumeText,
            jdText,
        });
        const chain = await buildCoverLetterChain(sessionId);

        const coverLetter = await chain.invoke({
            jdText,
            matchedSkills: analysis.matchedSkills,
            missingSkills: analysis.missingSkills,
            score: analysis.score,
        });
        return NextResponse.json({ coverLetter });
    } catch (e) {
        console.error("Cover letter error:", e);
        return NextResponse.json(
            { error: "Failed to generate cover letter" },
            { status: 500 },
        );
    }
}
