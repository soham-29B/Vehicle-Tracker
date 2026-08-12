import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import './HomePage.css';

function HomePage() {
    const [plate, setPlate] = useState('');
    const navigate = useNavigate();

    const handleSubmit = () => {
        const trimmed = plate.trim();
        if (!trimmed) return;
        navigate(`/track/${encodeURIComponent(trimmed)}`);
    };

    return (
        <div>
            <Header />
            <div className="homepage-hero">
                <div className="hero-pill"><span className="live-dot" /> Live GPS tracking</div>
                <h1>Where is my vehicle?</h1>
                <p>Enter your vehicle number to see its live location on the map in real time.</p>

                <div className="search-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9a9a9f" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Enter vehicle number"
                        value={plate}
                        onChange={(e) => setPlate(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                </div>

                <button className="track-button" onClick={handleSubmit}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <path d="M3 11l18-8-8 18-2-8-8-2z" />
                    </svg>
                    Track Now
                </button>

                <div className="preview-card" />
            </div>
        </div>
    );
}

export default HomePage;