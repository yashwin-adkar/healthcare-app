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
    password: "",
    role: ""
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

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

    if (!data.role) {
      err.role = "Select role";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const register = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const res = await axios.post(`${BASE_URL}/register`, data);

      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setMessage("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">

        <div className="left-panel">
          <h2>Start New Journey!</h2>
          <button onClick={() => navigate("/login")}>Sign In</button>
        </div>

        <div className="right-panel">
          <h2>Create Account</h2>

          {message && <p className="success">{message}</p>}
 {/* ROLE DROPDOWN */}
          <select name="role" onChange={handleChange}>
            <option value="">Select Role</option>
            <option value="user">User</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
            <option value="hospital">Hospital</option>
          </select>
          {errors.role && <p className="error">{errors.role}</p>}

          <input name="name" placeholder="Name" onChange={handleChange} />
          {errors.name && <p className="error">{errors.name}</p>}

          <input name="email" placeholder="Email" onChange={handleChange} />
          {errors.email && <p className="error">{errors.email}</p>}

          <input type="password" name="password" placeholder="Password" onChange={handleChange} />
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