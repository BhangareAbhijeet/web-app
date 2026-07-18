import React, { useState } from "react";
import "../styles/LanguageSelection.css";
import { useNavigate } from "react-router-dom";

const languages = [
  { name: "English", native: "English" },
  { name: "हिंदी", native: "Hindi" },
  { name: "தமிழ்", native: "Tamil" },
  { name: "తెలుగు", native: "Telugu" },
  { name: "বাংলা", native: "Bengali" },
  { name: "मराठी", native: "Marathi" },
  { name: "ಕನ್ನಡ", native: "Kannada" },
  { name: "ਪੰਜਾਬੀ", native: "Punjabi" },
  { name: "ગુજરાતી", native: "Gujarati" },
];

function LanguageSelection() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("English");

  return (
    <div className="language-page">
      <div className="language-container">
        {/* Heading */}
        <div className="heading">
          <div className="icon">🌐</div>
          <h1>Select Language</h1>
        </div>

        {/* Language Grid */}
        <div className="language-grid">
          {languages.map((lang) => (
            <div
              key={lang.name}
              className={`language-card ${
                selected === lang.name ? "language-active" : ""
              }`}
              onClick={() => setSelected(lang.name)}
            >
              <div className="language-text">
                <h3>{lang.name}</h3>
                <p>{lang.native}</p>
              </div>

              {selected === lang.name && (
                <span className="tick">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Button */}
        <button className="next-btn" onClick={() => navigate("/welcome")}>
          Next
        </button>
      </div>
    </div>
  );
}
export default LanguageSelection;
