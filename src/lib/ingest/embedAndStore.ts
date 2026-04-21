import type { Document } from "@langchain/core/documents";
import { embedder, embeddings } from "../embeddings";
import { chromaClient } from "../chroma";

export async function embedAndStore(docs: Document[], collectionName: string) {
    try {
        const texts = docs.map((doc) => doc.pageContent);
        const vectors = await embeddings.embedDocuments(texts);
        const collection = await chromaClient.getOrCreateCollection({
            name: collectionName,
            embeddingFunction: embedder,
        });
        await collection.add({
            ids: texts.map((_, i) => collectionName + "-" + i),
            documents: texts,
            embeddings: vectors,
            metadatas: docs.map((d) => {
                const flat: Record<string, string | number | boolean> = {};
                for (const [k, v] of Object.entries(d.metadata)) {
                    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
                        flat[k] = v;
                    } else if (v != null) {
                        flat[k] = JSON.stringify(v);
                    }
                }
                return flat;
            }),
        });
    } catch (e) {
        console.error(`embedAndStore Error: ${e}`);
        throw e;
    }
}
