import { skillGapChain } from "@/lib/chains/skillGap";
import { IsCollectionExists } from "@/lib/chroma";
import { SkillGapResult } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { sessionId, resumeText, jdText } = await req.json();
        if (!(await IsCollectionExists(sessionId))) {
            return NextResponse.json(
                {
                    error: "Session expired - please re-upload your resume",
                },
                { status: 404 },
            );
        }
        const results: SkillGapResult = await skillGapChain.invoke({jdText,resumeText});
        
        return NextResponse.json({
            ...results
        });
    } catch (e) {
        console.error("Analyse error:", e);
        return NextResponse.json(
            {error: "Failed to analyse resume" },
            { status: 500 },
        );
    }
}
