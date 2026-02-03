import { useState, useEffect, useRef } from 'react';
import { MapPin, Cloud, Camera, ArrowLeft, Thermometer, Wind, Droplets, FileText, Send, Loader2, Menu, X } from 'lucide-react';
import Webcam from 'react-webcam';
import { getWeather } from './services/WeatherService';
import { chatWithGemini, analyzePlantImage } from './services/GeminiService';
import { localDiagnose } from './services/LocalDiagnosisService';
import { AgriculturalInsights } from './components/AgriculturalInsights';
import './App.css';

function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard', 'diagnosis', 'weather'

  return (
    <div className="app-container">
      {view === 'dashboard' && <Dashboard onNavigate={setView} />}
      {view === 'diagnosis' && <DiagnosisView onBack={() => setView('dashboard')} />}
      {view === 'weather' && <WeatherView onBack={() => setView('dashboard')} />}
    </div>
  );
}

function Dashboard({ onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <button className="menu-toggle" onClick={() => setIsMenuOpen(true)}>
          <Menu size={32} />
        </button>
        <h1 className="app-title">Agri Doctor</h1>
      </div>

      {isMenuOpen && (
        <div className="side-menu-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className="side-menu" onClick={(e) => e.stopPropagation()}>
            <div className="side-menu-header">
              <button className="close-menu" onClick={() => setIsMenuOpen(false)}>
                <X size={32} />
              </button>
            </div>
            <div className="side-menu-content">
              <div className="coming-soon-badge">Coming Soon</div>
              <nav className="side-nav">
                <div className="nav-item-locked">My Profile</div>
                <div className="nav-item-locked">Crop History</div>
                <div className="nav-item-locked">Settings</div>
                <div className="nav-item-locked">About Us</div>
              </nav>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-actions">
        <button className="dashboard-btn" onClick={() => onNavigate('diagnosis')}>
          <FileText size={48} strokeWidth={2.5} />
          <span>Define Problem</span>
        </button>

        <button className="dashboard-btn" onClick={() => onNavigate('weather')}>
          <MapPin size={48} strokeWidth={2.5} />
          <span>Location & Weather</span>
        </button>
      </div>
    </div>
  );
}

function DiagnosisView({ onBack }) {
  const [mode, setMode] = useState('bot'); // Always start in bot mode now
  const [textInput, setTextInput] = useState('');
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [botChat, setBotChat] = useState([
    { type: 'bot', text: "Hello! I am Agri-Bot. You can send me a photo of your plant or describe the problem, and I'll help you diagnose it." }
  ]);
  const webcamRef = useRef(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    setShowCamera(false);
  };

  const handleBotSubmit = async () => {
    if (!textInput.trim() && !image) return;

    const userMsg = textInput || (image ? "I've attached a photo. Please analyze it." : "");
    const currentImage = image;

    setBotChat(prev => [...prev, { type: 'user', text: userMsg, image: currentImage }]);
    setTextInput('');
    setImage(null);
    setAnalyzing(true);

    try {
      let botResponse = "";

      if (currentImage) {
        const diagnosis = await analyzePlantImage(currentImage);
        if (diagnosis.isPlant) {
          botResponse = `It looks like ${diagnosis.disease} on ${diagnosis.name}. \n\nDescription: ${diagnosis.description}\n\nTreatment: ${diagnosis.treatment}`;
        } else {
          botResponse = diagnosis.description || "I couldn't identify a plant in that photo.";
        }
      } else {
        const history = botChat.slice(1);
        botResponse = await chatWithGemini(history, userMsg);

        if (botResponse.includes("quota") || botResponse.includes("limit")) {
          throw new Error("Quota Exceeded");
        }
      }

      setBotChat(prev => [...prev, { type: 'bot', text: botResponse }]);
    } catch (error) {
      console.warn("Gemini Error, falling back to Local Agri-Bot:", error);
      const localData = localDiagnose(userMsg);
      let fallbackMsg = localData.isPlant
        ? `I'm having trouble connecting to my advanced brain, but locally I think it might be ${localData.disease} on ${localData.name}. \n\nTreatment: ${localData.treatment}`
        : "Sorry, I'm experiencing connection issues and couldn't diagnose this locally either.";

      setBotChat(prev => [...prev, { type: 'bot', text: fallbackMsg }]);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="view-container">
      <div className="top-nav">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={24} /> Back
        </button>
      </div>

      <div className="diagnosis-content">
        <div className="bot-mode-container" style={{ height: '75vh' }}>
          <div className="bot-chat-window">
            {botChat.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.type}`}>
                {msg.image && <img src={msg.image} alt="Attached" style={{ width: '100%', borderRadius: '8px', marginBottom: '8px' }} />}
                {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
              </div>
            ))}
            {analyzing && <div className="chat-bubble bot"><Loader2 className="spin" /> Thinking...</div>}
            {showCamera && (
              <div className="scanner-container chat-inline-camera">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "environment" }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className="inline-camera-actions">
                  <button onClick={() => setShowCamera(false)} style={{ background: '#ef4444' }}>Cancel</button>
                  <button onClick={capture}>Capture</button>
                </div>
              </div>
            )}
          </div>

          {image && !showCamera && (
            <div className="image-preview-strip">
              <img src={image} alt="Preview" />
              <button onClick={() => setImage(null)} className="remove-img-btn">×</button>
            </div>
          )}

          <div className="bot-input-area">
            <button className="attach-btn" onClick={() => setShowCamera(true)} disabled={analyzing}>
              <Camera size={24} />
            </button>
            <input
              type="text"
              placeholder="Describe symptoms or ask about diagnosis..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleBotSubmit()}
            />
            <button className="send-btn" onClick={handleBotSubmit} disabled={analyzing || (!textInput.trim() && !image)}>
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ result, onReset }) {
  if (!result.isPlant) {
    return (
      <div className="weather-card" style={{ marginTop: '1rem', border: '2px dashed #f59e0b', background: '#fffbeb' }}>
        <h3 style={{ color: '#b45309' }}>Diagnosis Unclear</h3>
        <p>{result.description || "Could not identify the problem. Please try again with more details."}</p>
        <button className="scan-action-btn" onClick={onReset} style={{ background: '#f59e0b', marginTop: '1rem' }}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="weather-card" style={{ marginTop: '1rem', border: '4px solid var(--color-primary)' }}>
      <h2 style={{ fontSize: '1.5rem', color: result.disease === 'Healthy' ? '#16a34a' : '#dc2626', margin: '0 0 0.5rem 0' }}>
        {result.disease}
      </h2>
      <p style={{ margin: '0 0 0.5rem 0', color: '#64748b' }}>Detected on: {result.name}</p>
      {result.confidence && <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>Confidence: {(result.confidence * 100).toFixed(0)}%</p>}
      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
        <p style={{ margin: 0, fontWeight: 600 }}>Rx: {result.treatment}</p>
      </div>
      <button className="scan-action-btn" style={{ marginTop: '1rem', width: '100%' }} onClick={onReset}>New Diagnosis</button>
    </div>
  );
}

function WeatherView({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const weatherData = await getWeather(latitude, longitude);
          setData(weatherData);
        } catch (err) {
          setError("Failed to fetch weather");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError("Location access denied");
        setLoading(false);
      }
    );
  }, []);

  return (
    <div className="view-container">
      <div className="top-nav">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={24} /> Back
        </button>
      </div>

      {loading && <div style={{ marginTop: '20vh' }}><h3>Locating & fetching weather...</h3></div>}
      {error && <div style={{ marginTop: '20vh', color: 'red' }}><h3>{error}</h3></div>}

      {data && (
        <div className="weather-card">
          <div className="weather-header">
            <div>
              <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{data.location}</h2>
              <p style={{ margin: '0.5rem 0 0 0', color: '#64748b' }}>Current Conditions</p>
            </div>
            <Cloud size={64} color="var(--color-primary)" />
          </div>

          <div className="temp-large">{data.temp}°C</div>
          <p style={{ fontSize: '1.5rem', fontWeight: 500, margin: '0.5rem 0' }}>{data.condition}</p>

          <div className="weather-detail-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wind size={20} />
              <span>12 km/h</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Droplets size={20} />
              <span>68%</span>
            </div>
          </div>
        </div>
      )}

      {data && <AgriculturalInsights weatherData={data} />}
    </div>
  );
}

export default App;

