import { useEffect, useState, useCallback } from "react";
import { fetchLeaderboard } from "../api/api";

export default function Social() {
  const [type, setType] = useState("xp");
  const [leaders, setLeaders] = useState([]);

  const loadLeaderboard = useCallback(async () => {
    try {
      const data = await fetchLeaderboard(type);
      setLeaders(data);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    }
  }, [type]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  // Function to get background color by rank
  const getBackgroundColor = (index) => {
    switch (index) {
      case 0: return "#FFD700"; // Gold
      case 1: return "#C0C0C0"; // Silver
      case 2: return "#CD7F32"; // Bronze
      default: return "#E0E0E0"; // Light Grey for others
    }
  };

  return (
    <div style={{ padding: "20px", paddingBottom: "80px" }}>
      <h1>Leaderboard</h1>

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={{ marginBottom: "20px" }}
      >
        <option value="xp">Weekly XP</option>
        <option value="streak">Top Streaks</option>
        <option value="focus">Weekly Focus Minutes</option>
      </select>

      {leaders.map((user, index) => (
        <div
          key={index}
          style={{
            padding: "12px",
            marginBottom: "8px",
            background: getBackgroundColor(index),
            borderRadius: "8px",
            color: index > 2 ? "#555" : "#000", // Dark grey text for others
            fontWeight: index < 3 ? "bold" : "normal",
          }}
        >
          <strong>{index + 1}. {user.name}</strong>
          <span style={{ float: "right" }}>{user.value}</span>
        </div>
      ))}
    </div>
  );
}