import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let cachedModels = null;
let bestTextModel = null;
let bestVisionModel = null;
let exhaustedModels = new Set(); // Track models that hit quota limits

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
} else {
    console.warn("Gemini API Key is missing! AI features will be disabled.");
}

/**
 * Dynamically fetches available models for the API key
 */
const fetchAvailableModels = async () => {
    if (cachedModels) return cachedModels;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            cachedModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
            console.log("Gemini: Successfully discovered models", cachedModels.map(m => m.name));
            return cachedModels;
        }
        return [];
    } catch (error) {
        console.error("Gemini: Error fetching available models:", error);
        return [];
    }
};

/**
 * Finds the best available model based on a priority list
 */
const getModelByPriority = async (isVision = false) => {
    // If we already picked one and it's not exhausted, stick with it
    if (!isVision && bestTextModel && !exhaustedModels.has(bestTextModel)) return bestTextModel;
    if (isVision && bestVisionModel && !exhaustedModels.has(bestVisionModel)) return bestVisionModel;

    const available = await fetchAvailableModels();

    // Priorities adjusted to include common models and aliases
    const textPriorities = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash", "gemini-flash-latest", "gemini-pro"];
    const visionPriorities = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest", "gemini-pro-vision"];

    const searchList = isVision ? visionPriorities : textPriorities;

    // Try to find a match in the priority list that isn't exhausted
    for (const modelRegex of searchList) {
        const found = available.find(m => m.name.includes(modelRegex) && !exhaustedModels.has(m.name.split('/').pop()));
        if (found) {
            const selected = found.name.split('/').pop();
            if (isVision) bestVisionModel = selected;
            else bestTextModel = selected;
            console.log(`Gemini: Auto-selected ${isVision ? 'vision' : 'text'} model: ${selected}`);
            return selected;
        }
    }

    // Fallback: Just pick any available model that hasn't been exhausted
    const fallbackModel = available.find(m => !exhaustedModels.has(m.name.split('/').pop()));
    if (fallbackModel) {
        const fallback = fallbackModel.name.split('/').pop();
        console.warn(`Gemini: Falling back to available: ${fallback}`);
        return fallback;
    }

    return isVision ? "gemini-2.0-flash-lite" : "gemini-2.5-flash"; // Ultimate hardcoded fallback
};

export const generateText = async (prompt, retryCount = 0) => {
    if (!genAI) {
        return "AI service is not configured. Please add VITE_GEMINI_API_KEY to .env file.";
    }

    let currentModel = null;
    try {
        currentModel = await getModelByPriority(false);
        const modelInstance = genAI.getGenerativeModel({ model: currentModel });
        const result = await modelInstance.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error(`Gemini Text Error (${currentModel}):`, error);

        const isQuotaError = error.message?.includes("429") || error.message?.includes("quota") || error.message?.includes("limit");
        const isNotFoundError = error.message?.includes("404") || error.message?.includes("not found");

        if (retryCount < 3 && (isQuotaError || isNotFoundError)) {
            if (currentModel) {
                console.warn(`Gemini: Model ${currentModel} ${isQuotaError ? 'hit quota' : 'not found'}. Blacklisting and retrying...`);
                exhaustedModels.add(currentModel);
                if (currentModel === bestTextModel) bestTextModel = null;
            }

            // Wait a bit before retry if it's a rate limit/quota issue
            if (isQuotaError) await new Promise(r => setTimeout(r, 1000));

            return generateText(prompt, retryCount + 1);
        }

        return `Error: ${error.message || "Unknown error occurred"}`;
    }
};

/**
 * Unified conversational chat with Gemini.
 * Supports text history and optional base64 image.
 */
export const chatWithGemini = async (history, message, imageSrc = null, retryCount = 0) => {
    if (!genAI) {
        throw new Error("API Key is missing or service not initialized");
    }

    let currentModel = null;
    try {
        currentModel = await getModelByPriority(!!imageSrc);
        const modelInstance = genAI.getGenerativeModel({ model: currentModel });

        let contentParts = [];

        // Add image if provided
        if (imageSrc) {
            const base64Data = imageSrc.split(',')[1];
            contentParts.push({
                inlineData: { data: base64Data, mimeType: "image/jpeg" }
            });
        }

        // Add the current message
        contentParts.push(message);

        // Map simplified history to SDK format
        const chatHistory = history.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const chat = modelInstance.startChat({
            history: chatHistory,
            generationConfig: { maxOutputTokens: 1000 }
        });

        const result = await chat.sendMessage(contentParts);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error(`Gemini Chat Error (${currentModel}):`, error);

        const isQuotaError = error.message?.includes("429") || error.message?.includes("quota") || error.message?.includes("limit");
        if (retryCount < 2 && isQuotaError) {
            if (currentModel) {
                exhaustedModels.add(currentModel);
                if (currentModel === bestTextModel) bestTextModel = null;
                if (currentModel === bestVisionModel) bestVisionModel = null;
            }
            await new Promise(r => setTimeout(r, 1000));
            return chatWithGemini(history, message, imageSrc, retryCount + 1);
        }

        throw error;
    }
};

export const analyzePlantImage = async (imageSrc, retryCount = 0) => {
    if (!API_KEY || !genAI) {
        throw new Error("API Key is missing or service not initialized");
    }

    let currentModel = null;
    try {
        currentModel = await getModelByPriority(true);
        const visionModel = genAI.getGenerativeModel({ model: currentModel });

        // Prepare image data (strip the data:image/jpeg;base64, prefix)
        const base64Data = imageSrc.split(',')[1];
        const prompt = `
            Analyze this image for agricultural diagnosis.
            Return ONLY raw JSON with this structure:
            {
                "isPlant": boolean,
                "name": "Plant name",
                "disease": "Disease name or 'Healthy'",
                "confidence": number,
                "treatment": "Brief treatment advice",
                "description": "Short explanation"
            }
        `;

        const imagePart = {
            inlineData: { data: base64Data, mimeType: "image/jpeg" }
        };

        const result = await visionModel.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error(`Gemini Vision Error (${currentModel}):`, error);

        const isQuotaError = error.message?.includes("429") || error.message?.includes("quota") || error.message?.includes("limit");
        const isNotFoundError = error.message?.includes("404") || error.message?.includes("not found");

        if (retryCount < 3 && (isQuotaError || isNotFoundError)) {
            if (currentModel) {
                console.warn(`Gemini Vision: Model ${currentModel} ${isQuotaError ? 'hit quota' : 'not found'}. Blacklisting and retrying...`);
                exhaustedModels.add(currentModel);
                if (currentModel === bestVisionModel) bestVisionModel = null;
            }
            if (isQuotaError) await new Promise(r => setTimeout(r, 1000));
            return analyzePlantImage(imageSrc, retryCount + 1);
        }

        throw new Error(error.message || "Failed to connect to Gemini API");
    }
};
