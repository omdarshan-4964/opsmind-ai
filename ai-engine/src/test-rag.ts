import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { askAI } from './query';

dotenv.config();

const runTest = async () => {
    try {
        console.log("🔌 Connecting to DB...");
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error("MONGODB_URI is undefined");
        }
        console.log(`URI found (starts with: ${uri.substring(0, 10)}...)`);

        await mongoose.connect(uri)
            .then(() => console.log("✅ DB Connected successfully"))
            .catch(err => {
                console.error("❌ Mongoose Connection Error:", err);
                throw err;
            });

        // CHANGE THIS QUESTION to something inside your PDF
        const question = "What is the policy for sick leave?";
        console.log(`\n❓ Asking: "${question}"...`);

        const answer = await askAI(question);

        console.log("\n🤖 AI Answer:");
        console.log("------------------------------------------------");
        console.log(answer);
        console.log("------------------------------------------------");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

runTest();