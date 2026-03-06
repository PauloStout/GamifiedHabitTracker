import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkUser, login, register, completeProfile } from "../api/api";
import "./auth.css";

// Assets
import mascotImage from "../assets/mascots/WavingMascot.png";
import bookshelvesImage from "../assets/Bookshelves.jpg";

export default function Auth() {
  const navigate = useNavigate();

  const [step, setStep] = useState("auth");
  const [mode, setMode] = useState(null);
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [motivation, setMotivation] = useState("");
  const [primaryTheme, setPrimaryTheme] = useState("studies");

  const handleCheckUser = async () => {
    const exists = await checkUser(usernameOrEmail);
    setMode(exists ? "login" : "register");
  };

  const handleAuthSubmit = async () => {
    if (mode === "login") {
      const res = await login(usernameOrEmail, password);
      setUserId(res.user_id);
      navigate("/dashboard");
    }
    if (mode === "register") {
      const res = await register(usernameOrEmail, usernameOrEmail, password);
      setUserId(res.user_id);
      setStep("profile");
    }
  };

  const handleProfileSubmit = async () => {
    await completeProfile(userId, {
      first_name: firstName,
      last_name: lastName,
      motivation,
      primary_theme: primaryTheme,
    });
    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      {/* LEFT SIDE: Image background + Mascot */}
      <div
        className="auth-left"
        style={{ backgroundImage: `url(${bookshelvesImage})` }}
      >
        <div className="auth-brand-overlay">
          <img src={mascotImage} alt="Mascot" className="auth-mascot" />
          <h1 className="auth-brand-name">KangaRoutine</h1>
          <p className="auth-brand-tagline">Leap into Success!</p>
        </div>
      </div>

      {/* RIGHT SIDE: Auth/Profile Form */}
      <div className="auth-right">
        <div className="auth-card">
          {step === "auth" && (
            <>
              <h2 className="auth-title">Welcome</h2>
              <p className="auth-subtitle">Enter your email to get started</p>

              <input
                className="auth-input"
                placeholder="Email"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
              />
              {mode && (
                <input
                  className="auth-input"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
              {!mode ? (
                <button className="auth-btn" onClick={handleCheckUser}>Continue</button>
              ) : (
                <button className="auth-btn" onClick={handleAuthSubmit}>
                  {mode === "login" ? "Login" : "Create account"}
                </button>
              )}
            </>
          )}

          {step === "profile" && (
            <div className="profile-setup">
              <h2 className="auth-title">Tell us about you</h2>
              <label className="auth-label">First name</label>
              <input
                className="auth-input"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <label className="auth-label">Last name</label>
              <input
                className="auth-input"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <label className="auth-label">I am motivated by:</label>
              <textarea
                className="auth-textarea"
                placeholder="I am motivated by..."
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
              />
              <label className="auth-label">What do you struggle most with?</label>
              <select
                className="auth-select"
                value={primaryTheme}
                onChange={(e) => setPrimaryTheme(e.target.value)}
              >
                <option value="studies">Studies</option>
                <option value="exercise">Exercise</option>
                <option value="sleep">Sleep</option>
                <option value="nutrition">Nutrition</option>
              </select>
              <button className="auth-btn" onClick={handleProfileSubmit}>
                Go to dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}