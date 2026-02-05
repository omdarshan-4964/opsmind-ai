import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { DocumentChunkModel } from './models/DocumentChunk';

dotenv.config();

const clearDatabase = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error("MONGODB_URI is undefined");
        }

        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB");

        const count = await DocumentChunkModel.countDocuments();
        console.log(`📊 Found ${count} documents`);

        if (count > 0) {
            console.log("🗑️  Deleting all documents...");
            await DocumentChunkModel.deleteMany({});
            console.log("✅ All documents deleted successfully");
        } else {
            console.log("ℹ️  No documents to delete");
        }

    } catch (error) {
        console.error("❌ Error:", error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log("👋 Disconnected from MongoDB");
    }
};

clearDatabase();
