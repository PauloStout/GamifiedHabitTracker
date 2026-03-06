import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/api";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-page">
      {/* Left: branding */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-name">KangaRoutine</div>
          <div className="login-brand-tagline">Leap into Success!</div>
        </div>
      </div>

      {/* Right: form */}
      <div className="login-right">
        <div className="login-form-card">
          <h2 className="login-title">Login</h2>
          <p className="login-subtitle">Welcome Back!</p>

          <button className="login-google-btn" type="button">
            <span className="google-g">G</span>
            Continue with Google
          </button>

          <div className="login-divider"><span>OR</span></div>

          {error && <p className="login-error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <input
              className="login-input"
              type="text"
              placeholder="Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              className="login-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button className="login-submit-btn" type="submit">
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
