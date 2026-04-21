import { ChromaClient } from "chromadb";
import { BaseRetriever } from "@langchain/core/retrievers";
import { Document } from "@langchain/core/documents";
import { CallbackManagerForRetrieverRun } from "@langchain/core/callbacks/manager";
import { embeddings } from "./embeddings";

export const chromaClient = new ChromaClient({
    ssl: process.env.NODE_ENV == "production",
    host: process.env.CHROMA_HOST,
    port: parseInt(process.env.CHROMA_PORT ?? "8000"),
});

/* Create ChromaDB Retriever */
class ChromaRetriever extends BaseRetriever {
    lc_namespace: string[] = ["ai-job-app-assistant","src","lib","chroma"]; 
    constructor(
        private collectionName: string,
        private k: number,
    ) {
        super();
    }
    async _getRelevantDocuments(
        query: string,
        _callbacks?: CallbackManagerForRetrieverRun,
    ): Promise<Document[]> {
        const [queryVector] = await embeddings.embedDocuments([query]);
        const collection = await chromaClient.getCollection({
            name: this.collectionName,
        });
        const results = await collection.query({
            queryEmbeddings: [queryVector],
            nResults: this.k,
        });

        return (results.documents[0] ?? []).map(
            (text, i) =>
                new Document({
                    pageContent: text ?? "",
                    metadata: results.metadatas?.[0]?.[i] ?? {},
                }),
        );
    }
}

export const getSkillRetriever = (sid: string) => new ChromaRetriever(sid, 4);
export const getInterviewRetriever = (sid: string) =>new ChromaRetriever(sid, 6);
export const getChatRetriever = (sid: string) => new ChromaRetriever(sid, 3);
export const getJDRetriever = (sid: string) =>new ChromaRetriever(sid + "-jd", 4);

export async function IsCollectionExists(sessionId: string) {
    const collections = await chromaClient.listCollections();
    return collections.some((c) => c.name === sessionId);
}

export async function deleteSession(sessionId: string) {
    await chromaClient.deleteCollection({ name: sessionId });
    await chromaClient.deleteCollection({ name: sessionId+'-jd' });
}
