import "../styles/Signup.css";
import { useState} from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaChevronDown } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import CountryCodeSelect from "../pages/CountryCodeSelect";

export default function Signup() {
 
  const [showPassword, setShowPassword] = useState(false);
  const [country, setCountry] = useState(null); // defaults to India inside CountryCodeSelect
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  return (
    <div className="signup-page">
      <div className="back-btn">
        <IoArrowBack />
        <span>Back</span>
      </div>

      <div className="signup-box">
        <h1>Sign Up</h1>
        <p>Create an account to continue!</p>

        <div className="row">
          <input type="text" placeholder="First Name" required />
          <input type="text" placeholder="Last Name" required />
        </div>

        <input
          className="full-input"
          type="email"
          placeholder="Enter Your Email"
          required
        />

        <div className="select-wrapper">
          <span className="lang-icon">🟡</span>

          <select className="language-select">
            <option>English (English)</option>
            <option>हिंदी (Hindi)</option>
            <option>தமிழ் (Tamil)</option>
            <option>తెలుగు (Telugu)</option>
            <option>বাংলা (Bengali)</option>
            <option>मराठी (Marathi)</option>
            <option>ಕನ್ನಡ (Kannada)</option>
            <option>ਪੰਜਾਬੀ (Punjabi)</option>
            <option>ગુજરાતી (Gujarati)</option>
          </select>

          <FaChevronDown className="select-icon" />
        </div>

        <div className="phone-row">
          <CountryCodeSelect
            value={country?.iso2}
            onChange={setCountry}
            defaultIso2="in"
          />

          <input
            className="phone-input"
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="password">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
          />

          {showPassword ? (
            <FaEyeSlash
              className="eye"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <FaEye className="eye" onClick={() => setShowPassword(true)} />
          )}
        </div>

        <button className="register-btn" onClick={() => navigate("/messages")}>
          Register
        </button>

        <p className="login-text">
          Already have an account?
          <span>
            {" "}
            <a href="/login"> Login</a> 
          </span>
        </p>
      </div>
    </div>
  );
}
