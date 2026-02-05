// ai-engine/src/query.ts
import * as dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DocumentChunkModel } from "./models/DocumentChunk";
import { ChatMessage, AgentResponse, ToolCall } from "./types";
import { checkLeaveBalance, TOOL_DEFINITIONS } from "./tools";

dotenv.config();

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Legacy function for backward compatibility
 * Use askAgenticAI for new implementations
 */
export const askAI = async (question: string): Promise<string> => {
    const response = await askAgenticAI({ question, history: [] });
    return response.answer;
};

/**
 * Agentic AI with conversation history and tool calling
 * 
 * @param question - The user's question
 * @param history - Array of previous conversation messages (empty array if first message)
 * @param userId - Optional user ID for personalized tool calls
 * @returns AgentResponse with answer, sources, and metadata
 */
export const askAgenticAI = async ({
    question,
    history = [],
    userId = 'default',
}: {
    question: string;
    history?: ChatMessage[];
    userId?: string;
}): Promise<AgentResponse> => {
    const startTime = Date.now();
    const toolsCalled: ToolCall[] = [];
    
    try {
        console.log(`🤔 Agentic AI Processing: "${question}"`);
        console.log(`📚 History Length: ${history.length} messages`);

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

        // Store sources for response
        const sources = results.map((doc: any) => ({
            content: doc.content,
            score: doc.score,
        }));

        if (!results || results.length === 0) {
            return {
                answer: "I couldn't find any relevant information in the uploaded documents.",
                sources: [],
                toolsCalled: [],
                conversationContext: {
                    messageCount: history.length,
                    hasHistory: history.length > 0,
                },
                metadata: {
                    model: "gemini-pro",
                    embeddingModel: "text-embedding-004",
                    processingTime: Date.now() - startTime,
                    fallbackMode: false,
                },
            };
        }

        // 3. Check if question requires tool usage (basic keyword detection)
        const needsLeaveBalance = /balance|remaining|left|how many.*leave/i.test(question);
        
        if (needsLeaveBalance) {
            console.log(`🔧 Detected tool usage requirement: checkLeaveBalance`);
            try {
                const balanceData = await checkLeaveBalance(userId);
                toolsCalled.push({
                    toolName: 'checkLeaveBalance',
                    arguments: { userId },
                    result: balanceData,
                    timestamp: new Date().toISOString(),
                });
                console.log(`✅ Tool executed successfully:`, balanceData);
            } catch (toolError) {
                console.error(`❌ Tool execution failed:`, toolError);
            }
        }

        // 4. Construct Context with history and tool results
        const context = results.map((doc: any) => doc.content).join("\n\n---\n\n");
        
        // Build conversation history for context
        let conversationHistory = '';
        if (history.length > 0) {
            conversationHistory = '\n\nPREVIOUS CONVERSATION:\n';
            history.slice(-5).forEach(msg => { // Use last 5 messages for context
                conversationHistory += `${msg.role.toUpperCase()}: ${msg.content}\n`;
            });
        }
        
        // Add tool results to context
        let toolContext = '';
        if (toolsCalled.length > 0) {
            toolContext = '\n\nAVAILABLE TOOL DATA:\n';
            toolsCalled.forEach(tool => {
                toolContext += `Tool: ${tool.toolName}\n`;
                toolContext += `Result: ${JSON.stringify(tool.result, null, 2)}\n`;
            });
        }

        // 5. Generate Answer (With Safety Fallback)
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `You are a helpful AI assistant with access to company documents and tools.

CONTEXT FROM DOCUMENTS:
${context}
${toolContext}
${conversationHistory}

CURRENT QUESTION: ${question}

Instructions:
- Answer based on the CONTEXT and any tool data provided
- If tool data is available, incorporate it into your answer
- Be conversational and refer to previous messages if relevant
- If you don't know something, say so clearly`;

            const chatResult = await model.generateContent(prompt);
            const response = await chatResult.response;

            return {
                answer: response.text(),
                sources,
                toolsCalled,
                conversationContext: {
                    messageCount: history.length,
                    hasHistory: history.length > 0,
                },
                metadata: {
                    model: "gemini-pro",
                    embeddingModel: "text-embedding-004",
                    processingTime: Date.now() - startTime,
                    fallbackMode: false,
                },
            };

        } catch (apiError: any) {
            // 🛑 FALLBACK MODE: If API is Quota Limited, return raw text from DB
            console.warn("⚠️ AI Quota exceeded (429). Switching to Retrieval-Only mode.");
            console.warn("Returning raw context to Frontend.");
            
            const fallbackAnswer = toolsCalled.length > 0
                ? `(⚠️ Note: AI Daily Quota Reached - Showing Raw Database Result)\n\nHere is the relevant policy I found:\n\n${context}\n\nTool Data:\n${JSON.stringify(toolsCalled[0].result, null, 2)}`
                : `(⚠️ Note: AI Daily Quota Reached - Showing Raw Database Result)\n\nHere is the relevant policy I found:\n\n${context}`;
            
            return {
                answer: fallbackAnswer,
                sources,
                toolsCalled,
                conversationContext: {
                    messageCount: history.length,
                    hasHistory: history.length > 0,
                },
                metadata: {
                    model: "gemini-pro",
                    embeddingModel: "text-embedding-004",
                    processingTime: Date.now() - startTime,
                    fallbackMode: true,
                },
            };
        }

    } catch (error) {
        console.error("❌ Error in askAgenticAI:", error);
        throw error;
    }
};