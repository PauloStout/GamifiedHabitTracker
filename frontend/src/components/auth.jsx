import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkUser, login, register } from "../api/api";

const Auth = () => {
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // only for register
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [error, setError] = useState("");

  const handleNext = async () => {
    setError("");
    try {
      const exists = await checkUser(usernameOrEmail);
      setMode(exists ? "login" : "register");
      if (!exists) setEmail(usernameOrEmail); // optional prefill
    } catch (err) {
      setError("Something went wrong");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        const data = await login(usernameOrEmail, password);
        localStorage.setItem("accessToken", data.access);
        navigate("/");
      } else {
        await register(usernameOrEmail, email, password);
        // auto-login after registration
        const data = await login(usernameOrEmail, password);
        localStorage.setItem("accessToken", data.access);
        navigate("/");
      }
    } catch (err) {
      setError("Invalid credentials or registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{mode === "login" ? "Login" : "Register"}</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        placeholder="Username or Email"
        value={usernameOrEmail}
        onChange={(e) => setUsernameOrEmail(e.target.value)}
        required
        disabled={mode !== "login" && mode !== "register"} // prevent editing after check
      />

      {mode === "register" && (
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      )}

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {mode === "login" && (
        <button type="button" onClick={handleNext}>
          Next
        </button>
      )}

      {(mode === "register" || mode === "login") && (
        <button type="submit">{mode === "login" ? "Login" : "Create Account"}</button>
      )}
    </form>
  );
};

export default Auth;
