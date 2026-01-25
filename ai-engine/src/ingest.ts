// @ts-nocheck
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { DocumentChunkModel } from "./models/DocumentChunk";
import path from 'path';

// 1. Load Environment Variables
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "";
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || "";

if (!MONGO_URI || !GEMINI_API_KEY) {
    console.error("Error: Missing MONGODB_URI or GOOGLE_API_KEY in .env file");
    process.exit(1);
}

// 2. Initialize Gemini Embeddings
const embeddingsModel = new GoogleGenerativeAIEmbeddings({
    modelName: "embedding-001",
    apiKey: GEMINI_API_KEY,
});

const ingestDocument = async (filePath: string) => {
    try {
        // A. Connect to DB
        console.log(`🔌 Connecting to MongoDB Atlas...`);
        await mongoose.connect(MONGO_URI);
        console.log(`Connected.`);

        // B. Load PDF
        console.log(`Loading PDF: ${filePath}`);
        const loader = new PDFLoader(filePath);
        // NUCLEAR CAST: Cast result to any to access .length without issues
        const rawDocs = (await loader.load()) as any;
        console.log(`Loaded ${rawDocs.length} pages.`);

        // C. Split Text (Chunking)
        console.log(`Splitting text into chunks...`);
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        // NUCLEAR CAST: Cast result to any to access .length without issues
        const splitDocs = (await splitter.splitDocuments(rawDocs)) as any;
        console.log(`Created ${splitDocs.length} chunks.`);

        // D. Embed & Save
        console.log(`Generating Embeddings & Saving to DB...`);

        // NUCLEAR CAST: Explicitly type as any[]
        const chunksToSave: any[] = [];
        let count = 0;

        for (const doc of splitDocs) {
            // Add 20s delay to respect Gemini Free Tier rate limits
            await new Promise(resolve => setTimeout(resolve, 60000));
            const embedding = await embeddingsModel.embedQuery(doc.pageContent);

            chunksToSave.push({
                content: doc.pageContent,
                metadata: {
                    sourceFile: path.basename(filePath),
                    pageNumber: doc.metadata.loc?.pageNumber || 1,
                },
                vectorEmbedding: embedding,
            });
            process.stdout.write("."); // Progress dot
            count++;
        }

        // Bulk insert
        await DocumentChunkModel.insertMany(chunksToSave);

        console.log(`\n\nSuccess! Ingested ${count} vectors into MongoDB.`);

    } catch (error) {
        console.error("\nIngestion Failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
};

// --- Execution ---
// NUCLEAR CAST: Cast process.argv to any before indexing
const targetFile = (process.argv as any)[2];

if (!targetFile) {
    console.error("Usage: npx ts-node src/ingest.ts <path_to_pdf>");
    console.error("   Example: npx ts-node src/ingest.ts ../docs/My_Policy.pdf");
} else {
    ingestDocument(targetFile);
}
