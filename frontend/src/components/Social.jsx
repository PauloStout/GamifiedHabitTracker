import { useEffect, useState, useCallback } from "react";
import { fetchLeaderboard } from "../api/api";
import "./Social.css";

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

  const getBackgroundColor = (index) => {
    switch (index) {case 0: return "#FFD700";case 1: return "#C0C0C0";case 2: return "#CD7F32";default: return "#E0E0E0";}};

  const getMedal = (index) => {if (index === 0) return "🥇";if (index === 1) return "🥈";if (index === 2) return "🥉";
    return null;};

  return (
    <div className="social-page page-container">
      <h1><div className="leaderboard-heading">🏆 Weekly Leaderboard</div></h1>

      <select
        className="leaderboard-select"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="xp">Weekly XP</option>
        <option value="streak">Top Streaks</option>
        <option value="focus">Weekly Focus Minutes</option>
      </select>

      <div className="leaderboard-list">
        {leaders.map((user, index) => (
          <div
            key={index}
            className="leaderboard-row"
            style={{
              background: getBackgroundColor(index),
              fontWeight: index < 3 ? "bold" : "normal",
              color: index > 2 ? "#555" : "#000",
            }}
          >
            <span className="leaderboard-rank">{index + 1}.</span>
            {getMedal(index) && (
              <span className="leaderboard-medal">{getMedal(index)}</span>
            )}
            <div className="leaderboard-avatar">👤</div>
            <div className="leaderboard-user-info">
              <div className="leaderboard-user-name">{user.name}</div>
              <div className="leaderboard-user-sub">Level {user.level || "?"}</div>
            </div>
            <span className="leaderboard-value">{user.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}