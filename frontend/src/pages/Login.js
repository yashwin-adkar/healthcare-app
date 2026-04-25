import { useState } from "react";
import axios from "axios";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../api";

function Login() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // ✅ VALIDATION
  const validate = () => {
    let err = {};

    if (!data.email) err.email = "Email required";
    if (!data.password) err.password = "Password required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // 🔐 SEND OTP
  const sendOtp = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const res = await axios.post(`${BASE_URL}/login`, data);

      if (res.data.message === "Login successful ✅") {
        await axios.post(`${BASE_URL}/send_otp`, {
          email: data.email
        });

        setShowOtp(true);
        setMessage("OTP sent 📧");
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      setMessage("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  // 🔐 VERIFY OTP
  const verifyOtp = async () => {
    if (!otp) {
      setMessage("Enter OTP");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/verify_otp`, {
        email: data.email,
        otp: otp
      });

      if (res.data.message === "OTP verified") {
        navigate("/user");
      } else {
        setMessage("Invalid OTP ❌");
      }
    } catch {
      setMessage("OTP verification failed ❌");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">

        {/* LEFT PANEL */}
        <div className="left-panel">
          <h2>Welcome Back!</h2>
          <button onClick={() => navigate("/")}>Sign Up</button>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <h2>Sign In</h2>

          {message && <p className="error">{message}</p>}

          <input name="email" placeholder="Email" onChange={handleChange} />
          {errors.email && <p className="error">{errors.email}</p>}

          <input type="password" name="password" placeholder="Password" onChange={handleChange} />
          {errors.password && <p className="error">{errors.password}</p>}

          {!showOtp ? (
            <button onClick={sendOtp} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          ) : (
            <>
              <input
                placeholder="Enter OTP"
                onChange={(e) => setOtp(e.target.value)}
              />
              <button onClick={verifyOtp}>Login</button>

              {/* 🔁 RESEND OTP */}
              <p className="link" onClick={sendOtp}>
                Resend OTP
              </p>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default Login;