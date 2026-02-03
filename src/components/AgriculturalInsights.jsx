import { Lightbulb } from 'lucide-react';

export function AgriculturalInsights({ weatherData }) {
    if (!weatherData) return null;

    return (
        <div className="weather-card" style={{
            marginTop: '1rem',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1px solid #86efac',
            padding: '1.5rem',
            borderRadius: '12px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Lightbulb size={24} color="#16a34a" />
                <h3 style={{ margin: 0, color: '#15803d' }}>AI Field Insights</h3>
            </div>

            <div style={{
                color: '#166534',
                fontSize: '0.95rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '8px'
            }}>
                <span style={{
                    background: '#22c55e',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase'
                }}>Coming Soon</span>
                <span>Advanced AI advisory is being prepared for your field.</span>
            </div>
        </div>
    );
}
