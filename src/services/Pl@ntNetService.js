const API_KEY = import.meta.env.VITE_PLANTNET_API_KEY;
const API_URL = "/api/plantnet/v2/diseases/identify";

/**
 * Identify plant disease from an image usando the Pl@ntNet API
 * @param {string} imageSrc - Base64 data URL of the image
 * @returns {Promise<Object>} - Diagnosis result
 */
export const identifyDisease = async (imageSrc) => {
    if (!API_KEY) {
        throw new Error("Pl@ntNet API Key is missing! Please add VITE_PLANTNET_API_KEY to your .env file.");
    }

    try {
        // Convert base64 to Blob
        const blob = await fetch(imageSrc).then(res => res.blob());

        const formData = new FormData();
        formData.append("images", blob);
        formData.append("organs", "auto");

        const response = await fetch(`${API_URL}?api-key=${API_KEY}`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.message || "Failed to identify disease via Pl@ntNet");
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const topResult = data.results[0];
            return {
                isPlant: true,
                name: topResult.species.scientificNameWithoutAuthor || "Unknown Plant",
                disease: topResult.species.commonNames?.[0] || topResult.species.scientificNameWithoutAuthor,
                confidence: topResult.score,
                treatment: "Refer to agricultural guidelines for this condition.",
                description: `Identified via Pl@ntNet: ${topResult.species.scientificNameWithoutAuthor}`,
                source: "Pl@ntNet"
            };
        } else {
            return {
                isPlant: false,
                description: "Pl@ntNet could not identify any disease in this image."
            };
        }
    } catch (error) {
        console.error("Pl@ntNet Service Error:", error);
        throw error;
    }
};
