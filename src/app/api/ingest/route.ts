import { embedAndStore } from "@/lib/ingest/embedAndStore";
import { splitResume } from "@/lib/ingest/splitter";
import { unlinkSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    let tmpPath = "";
    try {
        const form = await req.formData();
        const resume = form.get("resume") as File;
        const jdText = form.get("jd") as string;

        if (!resume || !jdText) {
            return NextResponse.json(
                { error: "Both resume and jd are required" },
                { status: 400 },
            );
        }

        const sessionId = crypto.randomUUID();

        tmpPath = join(tmpdir(), sessionId + ".pdf");
        writeFileSync(tmpPath, Buffer.from(await resume.arrayBuffer()));

        /* Chunk the resume */
        const chunks = await splitResume(tmpPath);

        /* Extract resume text */
        const resumeText = chunks.map(c=>c.pageContent).join('\n\n')
        /* Store Resume */
        await embedAndStore(chunks, sessionId);

        /* Store Job Description */
        await embedAndStore(
            [{ pageContent: jdText, metadata: { source: "jd" } }],
            sessionId + "-jd",
        );

        return NextResponse.json({ sessionId, resumeText, chunksCount: chunks.length });
    } catch (e) {
        console.error("Ingest error:", e);
        return NextResponse.json(
            { error: "Failed to process resume" },
            { status: 500 },
        );
    } finally {
        try { if (tmpPath) unlinkSync(tmpPath); } catch (_) {}
    }
}
