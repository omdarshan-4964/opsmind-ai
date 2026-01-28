
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
    console.error("❌ Error: GOOGLE_API_KEY is missing in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

(async () => {
    try {
        console.log("📡 Listing available models...");
        // This is a hack because listModels is on the GoogleGenerativeAI instance but might be typed differently
        // Depending on SDK version, it might be separate. 
        // Let's try to access the model list endpoint manually if the SDK helper isn't obvious, 
        // but typically you just use a model to check. 

        // Actually, the SDK doesn't always expose listModels directly on the main class in all versions.
        // Let's try to just hit the endpoint with fetch if the SDK method fails or guess.

        // Better: let's try 'gemini-pro' and 'embedding-001' again but carefully.
        // Or wait, the error message SAID: "Call ListModels to see the list of available models".
        // This implies the API supports it. 

        // I'll try to use a simple fetch to the REST API to list models, bypassing the SDK for a second to be sure.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json() as any;

        if (data.models) {
            console.log("\n✅ Available Models:");
            data.models.forEach((m: any) => {
                console.log(`- ${m.name} [${m.supportedGenerationMethods.join(', ')}]`);
            });
        } else {
            console.log("❌ Failed to list models:", data);
        }

    } catch (error) {
        console.error("❌ Connectivity Test Failed:", error);
    }
})();
