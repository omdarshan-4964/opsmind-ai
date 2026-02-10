import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DocumentChunkModel } from "./models/DocumentChunk";

dotenv.config();

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const testVectorSearch = async () => {
    try {
        console.log("🔌 Connecting to DB...");
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error("MONGODB_URI is undefined");
        }

        await mongoose.connect(uri);
        console.log("✅ DB Connected successfully\n");

        const question = "How many days of sick leave am I allowed?";
        console.log(`❓ Question: "${question}"`);

        // Generate embedding
        const embeddingModel = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });
        const result = await embeddingModel.embedContent(question);
        const queryEmbedding = result.embedding.values;
        console.log(`📏 Query Embedding Length: ${queryEmbedding.length}`);

        // Vector Search
        const pipeline = [
            {
                $vectorSearch: {
                    index: "vector_index",
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

        console.log(`\n✅ Found ${results.length} relevant chunks:\n`);
        results.forEach((doc: any, index: number) => {
            console.log(`--- Chunk ${index + 1} (Score: ${doc.score.toFixed(4)}) ---`);
            console.log(doc.content);
            console.log();
        });

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

testVectorSearch();
