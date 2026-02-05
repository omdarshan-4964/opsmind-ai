import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { askAgenticAI } from './query';
import { ChatMessage } from './types';

dotenv.config();

const testAgenticAI = async () => {
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

        // Simulate a conversation with history
        const history: ChatMessage[] = [
            {
                role: 'user',
                content: 'Hello! I need information about company policies.',
                timestamp: new Date().toISOString(),
            },
            {
                role: 'assistant',
                content: 'Hi! I\'d be happy to help you with company policies. What would you like to know?',
                timestamp: new Date().toISOString(),
            },
        ];

        console.log("\n🤖 Test 1: Question WITH conversation history");
        console.log("=" .repeat(60));
        
        const question1 = "How many sick days do I have?";
        console.log(`\n❓ Question: "${question1}"`);
        console.log(`📚 History: ${history.length} previous messages\n`);

        const response1 = await askAgenticAI({
            question: question1,
            history: history,
            userId: 'user123',
        });

        console.log("\n🤖 AI Response:");
        console.log("------------------------------------------------");
        console.log(response1.answer);
        console.log("------------------------------------------------");
        console.log(`\n📊 Metadata:`);
        console.log(`  - Model: ${response1.metadata?.model}`);
        console.log(`  - Embedding Model: ${response1.metadata?.embeddingModel}`);
        console.log(`  - Processing Time: ${response1.metadata?.processingTime}ms`);
        console.log(`  - Fallback Mode: ${response1.metadata?.fallbackMode}`);
        console.log(`  - Sources Found: ${response1.sources?.length || 0}`);
        console.log(`  - Tools Called: ${response1.toolsCalled?.length || 0}`);
        
        if (response1.toolsCalled && response1.toolsCalled.length > 0) {
            console.log(`\n🔧 Tool Calls:`);
            response1.toolsCalled.forEach(tool => {
                console.log(`  - ${tool.toolName}:`, tool.result);
            });
        }

        if (response1.sources && response1.sources.length > 0) {
            console.log(`\n📄 Sources:`);
            response1.sources.forEach((source, idx) => {
                console.log(`  ${idx + 1}. Score: ${source.score.toFixed(4)}`);
                console.log(`     Content: ${source.content.substring(0, 100)}...`);
            });
        }

        // Test 2: Empty history (first message)
        console.log("\n\n🤖 Test 2: Question WITHOUT history (empty array)");
        console.log("=" .repeat(60));
        
        const question2 = "What is the remote work policy?";
        console.log(`\n❓ Question: "${question2}"`);
        console.log(`📚 History: Empty (first message in conversation)\n`);

        const response2 = await askAgenticAI({
            question: question2,
            history: [], // Empty history
            userId: 'user456',
        });

        console.log("\n🤖 AI Response:");
        console.log("------------------------------------------------");
        console.log(response2.answer);
        console.log("------------------------------------------------");
        console.log(`\n📊 Context Info:`);
        console.log(`  - Has History: ${response2.conversationContext?.hasHistory}`);
        console.log(`  - Message Count: ${response2.conversationContext?.messageCount}`);

    } catch (error) {
        console.error("\n❌ Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\n👋 Disconnected from MongoDB");
    }
};

testAgenticAI();
