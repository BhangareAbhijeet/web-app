import React, { useState } from "react";
import {
  FaGoogle,
  FaFacebookF,
  FaApple,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { FiSmartphone } from "react-icons/fi";
import "../styles/Login.css";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    alert("Login Successful!");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h3 className="login-logo">LokChat</h3>

        <h1>Log In</h1>

        <p className="subtitle">Enter your email and password to log in</p>

        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" required />

          <div className="password-box">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
            />

            <span
              className="eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="options">
            <label>
              <input type="checkbox" />
              Remember me
            </label>

            <a href="/">Forgot Password?</a>
          </div>

          <button className="login-btn">Log In</button>
        </form>

        <div className="divider">OR LOGIN WITH</div>

        <div className="social-icons">
          <button className="google">
            <FaGoogle />
          </button>

          <button className="facebook">
            <FaFacebookF />
          </button>

          <button className="apple">
            <FaApple />
          </button>

          <button className="phone">
            <FiSmartphone />
          </button>
        </div>

        <div className="signup">
          Don't have an account?
          <a href="/signup"> Sign Up</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
