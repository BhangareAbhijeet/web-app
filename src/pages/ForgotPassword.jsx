import "../styles/ForgotPassword.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      // Replace with your backend API
      const res = await axios.post(
        "https://api.lokchat.techiolazainnovations.in/api/forgot-password",
        { email },
      );

      alert(res.data.message);

      navigate("/verify-otp", {
        state: { email },
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <h1>Forgot Password</h1>

        <p>Enter your registered email to receive OTP</p>

        <form onSubmit={handleSendOTP}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit">{loading ? "Sending..." : "Send OTP"}</button>
        </form>

        <Link to="/login">Back to Login</Link>
      </div>
    </div>
  );
}
