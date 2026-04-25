import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user" element={<h2>User Dashboard</h2>} />
        <Route path="/doctor" element={<h2>Doctor Dashboard</h2>} />
        <Route path="/admin" element={<h2>Admin Dashboard</h2>} />
      </Routes>
    </Router>
  );
}

export default App;