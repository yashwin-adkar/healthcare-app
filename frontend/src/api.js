const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:5000"
    : "https://healthcare-backend-07ts.onrender.com";

export default BASE_URL;