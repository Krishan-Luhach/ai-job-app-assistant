import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { loadAndCleanPdf } from "./pdfLoader";

export async function splitResume(pdfPath:string){
    const docs = await loadAndCleanPdf(pdfPath);
    console.log("Parsed Docs:: ",docs);
    const splitter = new RecursiveCharacterTextSplitter({
        chunkOverlap:100,
        chunkSize:600,
        separators: ['\n\n', '\n', '. ', ' ', '']
    });

    const chunks = await splitter.splitDocuments(docs);

    console.log("Chunks created: ",chunks.length);
    return chunks;
}