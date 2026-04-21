import { chromaClient, getSkillRetriever } from "@/lib/chroma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await chromaClient.heartbeat();
        const collections = await chromaClient.listCollections();
        if (collections.length > 0) {
            const testSid = collections[0].name;
            const testRetriever = getSkillRetriever(testSid);
            await testRetriever._getRelevantDocuments("Hi, how are you!");
            return NextResponse.json({
                status: "ok",
                collections: collections.map((c) => c.name),
            });
        }
        return NextResponse.json({ status: "ok", collections: [] });
    } catch (err) {
        return NextResponse.json(
            { status: "error", message: String(err) },
            { status: 500 },
        );
    }
}
