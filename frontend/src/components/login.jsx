import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/api";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await login(username, password);

      // Store tokens
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);

      // Go to dashboard
      navigate("/");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Log in</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Log in</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    width: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  error: {
    color: "red",
  },
};

export default Login;
