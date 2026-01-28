import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DocumentChunkModel } from "./models/DocumentChunk";
import path from 'path';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "";
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const ingestDocument = async (filePath: string) => {
    try {
        console.log(`🔌 Connecting to DB...`);
        await mongoose.connect(MONGO_URI);

        console.log(`📂 Loading PDF: ${filePath}`);
        const loader = new PDFLoader(filePath);
        const rawDocs = await loader.load();

        console.log(`✂️ Splitting text...`);
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const splitDocs = await splitter.splitDocuments(rawDocs);
        console.log(`🧩 Created ${splitDocs.length} chunks.`);

        console.log(`🧠 Generating Embeddings (Model: gemini-embedding-001)...`);
        const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

        const chunksToSave = [];

        for (const doc of splitDocs) {
            // Use Raw SDK to generate embedding
            const result = await model.embedContent(doc.pageContent);
            const embedding = result.embedding.values;

            chunksToSave.push({
                content: doc.pageContent,
                metadata: {
                    sourceFile: path.basename(filePath),
                    pageNumber: doc.metadata.loc?.pageNumber || 1,
                },
                vectorEmbedding: embedding,
            });
            process.stdout.write("✅ ");
        }

        await DocumentChunkModel.insertMany(chunksToSave);
        console.log(`\n🎉 Success! Saved ${chunksToSave.length} vectors.`);

    } catch (error) {
        console.error("❌ Ingestion Failed:", error);
    } finally {
        await mongoose.disconnect();
    }
};

// --- Execution ---
const targetFile = process.argv[2];
if (targetFile) {
    ingestDocument(targetFile);
} else {
    console.error("Usage: npx ts-node src/ingest.ts <path-to-pdf>");
}