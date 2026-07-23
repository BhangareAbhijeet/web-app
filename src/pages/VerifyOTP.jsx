import "../styles/VerifyOTP.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";

export default function VerifyOTP() {
  const [timer, setTimer] = useState(20);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };
useEffect(() => {
  if (timer === 0) return;

  const interval = setInterval(() => {
    setTimer((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [timer]);
const handleResendOTP = async () => {
  try {
    // TODO: Call resend OTP API here

    alert("OTP sent successfully!");

    setOtp(["", "", "", "", "", ""]);
    setTimer(20);

    document.getElementById("otp-0").focus();
  } catch (err) {
    alert("Failed to resend OTP");
  }
};
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://api.lokchat.techiolazainnovations.in/api/verify-otp",
        {
          email,
          otp: otpValue,
        }
      );

      alert(res.data.message);

      navigate("/reset-password", {
        state: {
          email,
          otp: otpValue,
        },
      });
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-page">
      <div className="otp-card">

        <h1>Enter OTP</h1>

        <p className="otp-text">
          Please enter the 6-digit code sent to your email address.
        </p>

        <p className="otp-email">{email}</p>

        <form onSubmit={handleVerifyOTP}>

          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          </div>

          <button
            type="submit"
            className="verify-btn"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

        </form>

        <p className="resend-text">
  {timer > 0 ? (
    <>Resend OTP in {timer}s</>
  ) : (
    <span
      className="resend-link"
      onClick={handleResendOTP}
    >
      Resend OTP
    </span>
  )}
</p>

        <Link to="/login" className="back-login">
          Back to Login
        </Link>

      </div>
    </div>
  );
}
