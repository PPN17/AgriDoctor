
// WeatherService.js - Now with Real APIs

export const getWeather = async (lat, lon) => {
    try {
        // 1. Get Location Name (Reverse Geocoding)
        // Using BigDataCloud's free client API (no key needed for client-side)
        const geoResponse = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
        );
        const geoData = await geoResponse.json();

        // precise location: Locality, City or just City
        const locationName = `${geoData.locality || geoData.city || ''}, ${geoData.principalSubdivision || ''}`.trim() || "Unknown Location";

        // 2. Get Weather Data
        // Using Open-Meteo (Free, no key)
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        const weatherData = await weatherResponse.json();
        const current = weatherData.current_weather;

        // Map WMO weather codes to simple descriptions
        const weatherCodeMap = {
            0: "Clear Sky",
            1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
            45: "Foggy", 48: "Depositing Rime Fog",
            51: "Light Drizzle", 53: "Moderate Drizzle", 55: "Dense Drizzle",
            61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain",
            71: "Slight Snow", 73: "Moderate Snow", 75: "Heavy Snow",
            80: "Slight Showers", 81: "Moderate Showers", 82: "Violent Showers",
            95: "Thunderstorm", 96: "Thunderstorm + Hail", 99: "Thunderstorm + Heavy Hail"
        };
        const condition = weatherCodeMap[current.weathercode] || "Variable";

        return {
            temp: Math.round(current.temperature),
            condition: condition,
            location: locationName,
            icon: "cloud",
            isRisk: current.weathercode > 50, // Simple risk logic: rain/humid conditions
            riskMessage: current.weathercode > 50
                ? "Fungal risk high due to moisture."
                : "Conditions optimal for field work."
        };

    } catch (error) {
        console.error("Weather fetch failed", error);
        return {
            temp: "--",
            condition: "Unavailable",
            location: "Connection Error",
            isRisk: false,
            riskMessage: "Could not fetch data."
        };
    }
};
