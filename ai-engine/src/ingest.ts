// ai-engine/src/ingest.ts
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";
import * as path from "path";
import * as dotenv from "dotenv";
import { DocumentChunkModel } from "./models/DocumentChunk";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/opsmind";
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || "";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });

/**
 * Ingests a PDF file into the vector database
 * @param filePath - Path to the PDF file
 */
export async function ingestPDF(filePath: string): Promise<void> {
    try {
        console.log(`📄 Loading PDF: ${filePath}`);
        
        // Connect to MongoDB
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(MONGODB_URI);
            console.log("✅ Connected to MongoDB");
        }

        // Load PDF
        const loader = new PDFLoader(filePath);
        const docs = await loader.load();
        console.log(`📚 Loaded ${docs.length} pages from PDF`);

        // Split documents into chunks
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const splitDocs = await textSplitter.splitDocuments(docs);
        console.log(`✂️ Split into ${splitDocs.length} chunks`);

        // Process and save chunks
        const chunksToSave = [];
        
        for (const doc of splitDocs) {
            // 🛑 SAFETY DELAY: Wait 4 seconds to respect Gemini Free Tier (15 req/min)
            console.log("⏳ Waiting 4s to avoid rate limit...");
            await new Promise(resolve => setTimeout(resolve, 4000));

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
            process.stdout.write("✅ Saved Chunk! \n");
        }

        // Bulk insert all chunks
        await DocumentChunkModel.insertMany(chunksToSave);
        console.log(`\n🎉 Successfully ingested ${chunksToSave.length} chunks from ${path.basename(filePath)}`);

    } catch (error) {
        console.error("❌ Error during ingestion:", error);
        throw error;
    }
}

// CLI usage
if (require.main === module) {
    const filePath = process.argv[2];
    
    if (!filePath) {
        console.error("❌ Usage: ts-node ingest.ts <path-to-pdf>");
        process.exit(1);
    }

    ingestPDF(filePath)
        .then(() => {
            console.log("✅ Ingestion complete");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Ingestion failed:", error);
            process.exit(1);
        });
}