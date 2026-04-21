import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { GoogleGeminiEmbeddingFunction } from "@chroma-core/google-gemini";

export const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
    apiKey: process.env.GOOGLE_API_KEY,
});

export const embedder = new GoogleGeminiEmbeddingFunction({
  apiKey: process.env.GEMINI_API_KEY,
  modelName: "gemini-embedding-001",
});