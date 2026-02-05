// ai-engine/src/query.ts
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DocumentChunkModel } from "./models/DocumentChunk";

dotenv.config();

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const askAI = async (question: string): Promise<string> => {
    try {
        console.log(`🤔 Asking AI: "${question}"`);

        // 1. Generate Embedding using RAW Google SDK (Model: text-embedding-004)
        // ✅ CRITICAL: Must match the model used in ingest.ts
        const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await embeddingModel.embedContent(question);
        const queryEmbedding = result.embedding.values;
        console.log(`📏 Query Embedding Length: ${queryEmbedding.length}`);

        // 2. Vector Search Pipeline
        const pipeline = [
            {
                $vectorSearch: {
                    index: "vector_index", // Must match MongoDB Atlas Index Name
                    path: "vectorEmbedding",
                    queryVector: queryEmbedding,
                    numCandidates: 100,
                    limit: 3,
                },
            },
            {
                $project: {
                    _id: 0,
                    content: 1,
                    score: { $meta: "vectorSearchScore" },
                },
            },
        ];

        const results = await DocumentChunkModel.aggregate(pipeline);

        if (!results || results.length === 0) {
            return "I couldn't find any relevant information in the uploaded documents.";
        }

        // 3. Construct Context
        const context = results.map((doc: any) => doc.content).join("\n\n---\n\n");

        // 4. Generate Answer (With Safety Fallback)
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `You are a helpful assistant. Answer the QUESTION based ONLY on the CONTEXT below.\n\nCONTEXT:\n${context}\n\nQUESTION:\n${question}`;

            const chatResult = await model.generateContent(prompt);
            const response = await chatResult.response;

            return response.text();

        } catch (apiError: any) {
            // 🛑 FALLBACK MODE: If API is Quota Limited, return raw text from DB
            console.warn("⚠️ AI Quota exceeded (429). Switching to Retrieval-Only mode.");
            console.warn("Returning raw context to Frontend.");
            
            return `(⚠️ Note: AI Daily Quota Reached - Showing Raw Database Result)\n\nHere is the relevant policy I found:\n\n${context}`;
        }

    } catch (error) {
        console.error("❌ Error in askAI:", error);
        // Don't crash the server, return a friendly error
        return "System Error: Unable to process request at this time.";
    }
};