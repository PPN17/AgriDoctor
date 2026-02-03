/**
 * Local database of common crop diseases for offline/fallback diagnosis.
 */
const CROP_DATABASE = {
    tomato: [
        {
            symptoms: ["yellow spots", "bottom leaves", "turning brown"],
            disease: "Early Blight",
            treatment: "Apply fungicide, remove infected lower leaves, and ensure proper spacing for airflow.",
            description: "A common fungal disease that starts on older leaves and moves up the plant."
        },
        {
            symptoms: ["wilting", "yellowing", "drooping"],
            disease: "Fusarium Wilt",
            treatment: "Use resistant varieties, improve soil drainage, and avoid planting in the same spot.",
            description: "Soil-borne fungus that blocks the plant's water-conducting tissues."
        }
    ],
    rice: [
        {
            symptoms: ["diamond spots", "gray center", "leaf lesions"],
            disease: "Rice Blast",
            treatment: "Use balanced nitrogen, flood fields properly, and apply recommended fungicides.",
            description: "One of the most destructive diseases of rice worldwide."
        },
        {
            symptoms: ["streaks", "yellowish", "wilted leaves"],
            disease: "Bacterial Leaf Blight",
            treatment: "Avoid excessive nitrogen, maintain clean water, and use resistant cultivars.",
            description: "Common during rainy seasons, spreads via water and wind."
        }
    ],
    wheat: [
        {
            symptoms: ["orange spots", "rust color", "pustules"],
            disease: "Leaf Rust",
            treatment: "Plant resistant varieties and use triazole fungicides early in the season.",
            description: "A fungal disease that affects photosynthesis and reduces grain yield."
        }
    ],
    general: [
        {
            symptoms: ["white powder", "fuzzy", "spots"],
            disease: "Powdery Mildew",
            treatment: "Improve sunlight, use neem oil or sulfur-based sprays.",
            description: "A fungal infection visible as white flour-like coating on leaves."
        },
        {
            symptoms: ["holes", "bitten", "missing leaves"],
            disease: "Pest Attack (General)",
            treatment: "Inspect for insects, use organic neem spray or appropriate insecticide.",
            description: "Damage caused by local pests like caterpillars or grasshoppers."
        }
    ]
};

/**
 * Simulates a diagnosis by matching symptoms in the text.
 */
export const localDiagnose = (text) => {
    const input = text.toLowerCase();

    // Check specific crops first
    for (const crop in CROP_DATABASE) {
        if (input.includes(crop)) {
            const matches = CROP_DATABASE[crop].filter(d =>
                d.symptoms.some(s => input.includes(s))
            );
            if (matches.length > 0) return { ...matches[0], isPlant: true, name: crop.charAt(0).toUpperCase() + crop.slice(1) };
        }
    }

    // Check general database
    const generalMatches = CROP_DATABASE.general.filter(d =>
        d.symptoms.some(s => input.includes(s))
    );
    if (generalMatches.length > 0) return { ...generalMatches[0], isPlant: true, name: "General Plant" };

    return {
        isPlant: false,
        description: "I'm not sure about this specific issue. Try describing the color and shape of the spots or symptoms more clearly."
    };
};
