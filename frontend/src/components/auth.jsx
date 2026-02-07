import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkUser, login, register, completeProfile } from "../api/api";

export default function Auth() {
  const navigate = useNavigate();

  const [step, setStep] = useState("auth"); // auth | profile
  const [mode, setMode] = useState(null); // login | register

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");

  const [userId, setUserId] = useState(null);

  // Profile step
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [motivation, setMotivation] = useState("");

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
    await completeProfile(userId, { first_name: firstName, last_name: lastName, motivation });
    navigate("/dashboard");
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      {step === "auth" && (
        <>
          <h2>Welcome</h2>
          <input
            placeholder="Email"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
          />
          {mode && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
          {!mode ? (
            <button onClick={handleCheckUser}>Continue</button>
          ) : (
            <button onClick={handleAuthSubmit}>
              {mode === "login" ? "Login" : "Create account"}
            </button>
          )}
        </>
      )}

      {step === "profile" && (
        <>
          <h2>Tell us about you</h2>
          <input
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <textarea
            placeholder="What motivates you?"
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
          />
          <button onClick={handleProfileSubmit}>Go to dashboard</button>
        </>
      )}
    </div>
  );
}
