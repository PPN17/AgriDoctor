import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("No API Key found");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    try {
        const modelResponse = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // The above line doesn't list, it gets. We need the list method if available on the client, 
        // but the SDK structure is usually specific. 
        // Actually, calling the API directly might be easier or using the proper method if I knew it by heart. 
        // But standard SDK usage:
        // There is no direct `listModels` on `genAI` instance in typical JS SDK usage?
        // Wait, typical usage:
        // import { GoogleGenerativeAI } from "@google/generative-ai";
        // const genAI = new GoogleGenerativeAI(process.env.API_KEY);
        // This SDK doesn't always expose listModels directly in the helper.

        // Let's try to just hit the REST endpoint or use a known fallback.
        // However, I will try to use the `gemini-pro-vision` as a fallback since it's the predecessor.
        console.log("Checking gemini-1.5-flash...");
    } catch (e) {
        console.log("Error:", e.message);
    }
}

// Actually, let's just use the REST API to list models to correspond to the error message advice.
// "Call ListModels to see the list of available models"
import fetch from "node-fetch";

async function checkModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name} (${m.displayName}) methods: ${m.supportedGenerationMethods}`);
                }
            });
        } else {
            console.log("No models found or error:", data);
        }
    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

checkModels();
