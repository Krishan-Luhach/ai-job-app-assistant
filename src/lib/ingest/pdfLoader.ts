import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import type { Document } from "@langchain/core/documents";
export async function loadAndCleanPdf(path: string): Promise<Document[]> {
    const loader = new PDFLoader(path, { splitPages: true });
    const rawDocs = await loader.load();
    return rawDocs.map((doc) => ({
        ...doc,
        pageContent: doc.pageContent
            .replace(/\s+/g, " ") // collapse whitespace
            .replace(/[^\x20-\x7E]/g, "") // remove non-ASCII garbage
            .trim(),
    }));
}
