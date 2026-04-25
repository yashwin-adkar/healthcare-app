import { useState } from "react";
import axios from "axios";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../api";

function Register() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // ✅ VALIDATION
  const validate = () => {
    let err = {};

    if (!data.name) err.name = "Name is required";

    if (!data.email) {
      err.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      err.email = "Invalid email format";
    }

    if (!data.password) {
      err.password = "Password required";
    } else if (data.password.length < 6) {
      err.password = "Minimum 6 characters required";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // 🚀 REGISTER FUNCTION
  const register = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const res = await axios.post(`${BASE_URL}/register`, {
        ...data,
        role: "user"
      });

      setMessage(res.data.message);

      // ✅ Redirect after success
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      if (err.response) {
        setMessage(err.response.data.message);
      } else {
        setMessage("Server error ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">

        {/* LEFT PANEL */}
        <div className="left-panel">
          <h2>Start New Journey!</h2>
          <button onClick={() => navigate("/login")}>Sign In</button>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <h2>Create Account</h2>

          {message && <p className="success">{message}</p>}

          <input
            name="name"
            placeholder="Name"
            onChange={handleChange}
          />
          {errors.name && <p className="error">{errors.name}</p>}

          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
          />
          {errors.email && <p className="error">{errors.email}</p>}

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
          />
          {errors.password && <p className="error">{errors.password}</p>}

          <button onClick={register} disabled={loading}>
            {loading ? "Creating..." : "Sign Up"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default Register;