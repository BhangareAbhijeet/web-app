import React, { useState } from "react";
import "../styles/Welcome.css";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import BackgroundImage from "../assets/bg-design-dark.png";
import GetStartedImage from "../assets/welcome.png";
import WelcomeImage from "../assets/imageonborading2.png";

const Welcome = () => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (page < 3) {
      setPage((prev) => prev + 1);
    } else {
      navigate("/selectionpage"); // Change this route if needed
    }
  };

  return (
    <div
      className="welcome-container"
      
    >
      <div className="welcome-content">
        {/* Image */}
        <div className="welcome-image">
          <img
            src={page === 1 ? GetStartedImage : WelcomeImage}
            alt="Welcome"
          />
        </div>

        {/* Heading */}
        <h1 className="welcome-title">
          {page === 1 && "Welcome to LokChat"}
          {page === 2 && "Start Talking, Stay Connected."}
          {page === 3 && "Your Privacy Matters"}
        </h1>

        {/* Description */}
        <p className="welcome-description">
          {page === 1 && (
            <>
              Bring your favorite people together and
              <br />
              start meaningful conversations.
            </>
          )}

          {page === 2 && (
            <>
              Connect instantly with friends, family, or colleagues.
              <br />
              Your conversations, your way.
            </>
          )}

          {page === 3 && (
            <>
              Every message is encrypted, so your chats stay
              <br />
              personal and safe.
            </>
          )}
        </p>

        {/* Button */}
        <button className="next-button" onClick={handleNext}>
          <span>{page === 1 ? "Get Started" : "Next"}</span>
          <FaArrowRight />
        </button>

        {/* Dots */}
        <div className="welcome-dots">
          <span className={page === 1 ? "dot dot-active" : "dot"}></span>
          <span className={page === 2 ? "dot dot-active" : "dot"}></span>
          <span className={page === 3 ? "dot dot-active" : "dot"}></span>
        </div>
      </div>
    </div>
  );
};

export default Welcome;