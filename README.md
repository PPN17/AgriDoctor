# 🌾 AgriDoctor - Your Intelligent Agricultural Companion

[![GitHub stars](https://img.shields.io/github/stars/PPN17/AgriDoctor?style=social)](https://github.com/PPN17/AgriDoctor)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**AgriDoctor** is a modern, responsive web application designed to empower farmers with AI-driven plant diagnosis, conversational agricultural advice, and real-time weather insights. Powered directly by Google Gemini, it brings cutting-edge multi-modal AI to the field.

---

## ✨ Key Features

### 🤖 Visual Agri-Bot (Multi-Modal)
*   **Instant Diagnosis**: Take or upload a photo of a sick plant, and Gemini will identify the disease and suggest treatments.
*   **Conversational Memory**: Ask follow-up questions like *"Is it contagious?"* or *"What fungicide is best?"* after a diagnosis.
*   **Robust Fallback**: Built-in local database provides reliable advice even when AI quota is exceeded.

### 🌤️ Weather Intelligence
*   **Precision Farming**: Real-time local weather data.
*   **AI Insights**: Personalized agricultural advice based on current humidity, temperature, and wind conditions.

### 📱 Premium Responsive Design
*   **Modern UI**: Sleek, high-contrast interface optimized for outdoor visibility.
*   **Cross-Device**: Seamless experience across mobile, tablet, and laptop screens.
*   **Side Menu**: Intuitive navigation with a professional sliding sidebar.

---

## 🚀 Tech Stack

- **Frontend**: React.js, Vite
- **AI Core**: Google Gemini 1.5/2.0 Flash (Vision & Text)
- **Icons**: Lucide React
- **Styling**: Modern CSS with Glassmorphism
- **API**: Weather API integration

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- A Google Gemini API Key (Get it at [Google AI Studio](https://aistudio.google.com/))

### Installation
1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/PPN17/AgriDoctor.git
    cd AgriDoctor
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Config Environment**: Create a `.env` file in the root directory:
    ```env
    VITE_GEMINI_API_KEY=your_key_here
    VITE_WEATHER_API_KEY=your_weather_api_key (if applicable)
    ```
4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

---

## 📸 Screenshots

| Dashboard | Visual Agri-Bot | Weather Insights |
| :---: | :---: | :---: |
| ![Dashboard](/public/dashboard_thumb.png) | ![Chat](/public/chat_thumb.png) | ![Weather](/public/weather_thumb.png) |

---

## 🗺️ Roadmap
- [ ] User Profiles & Farm History
- [ ] Community Disease Heatmaps
- [ ] Expert-in-the-loop validation
- [ ] Pesticide/Fungicide marketplace integration

## 📄 License
This project is licensed under the MIT License - see the `LICENSE` file for details.

---
*Developed with ❤️ for Farmers everywhere.*
