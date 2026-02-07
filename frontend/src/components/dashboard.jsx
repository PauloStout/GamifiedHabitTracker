import { useEffect, useState } from "react";
import { fetchDashboardData } from "../api/api";

function Dashboard() {
  const [data, setData] = useState(() => {
    // Load from localStorage first for persistence
    const saved = localStorage.getItem("dashboardData");
    return saved ? JSON.parse(saved) : null;
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData()
      .then(setData)
      .catch(err => setError(err.message));
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>Loading dashboard...</p>;

  return (
    <div style={{ maxWidth: 400, margin: "auto", textAlign: "center" }}>
      <h1>Hi {data.first_name || data.username}!</h1>
      <p>Level: {data.level}</p>
      <p>Total XP: {data.total_xp}</p>
      <p>Motivation: {data.motivation || "Not set"}</p>
    </div>
  );
}

export default Dashboard;
