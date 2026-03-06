import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, BarChart, Bar
} from "recharts";
import { fetchProgressData, fetchAchievements } from "../api/api";

export default function Progress() {
  const [progressData, setProgressData] = useState([]);
  const [achievementsData, setAchievementsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      const [pData, aData] = await Promise.all([
        fetchProgressData(),
        fetchAchievements()
      ]);

      setProgressData(pData);
      setAchievementsData(aData.achievements);
    } catch (err) {
      console.error(err);
      setError("Failed to load progress. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <p style={{ padding: "20px" }}>Loading progress...</p>;
  if (error) return <p style={{ padding: "20px", color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px", paddingBottom: "80px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px" }}>Your Progress</h1>

      {/* ACHIEVEMENTS GRID */}
      <div style={{ marginBottom: "50px" }}>
        <h2>Achievements</h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "15px",
          marginTop: "15px"
        }}>
          {achievementsData.map((ach) => (
            <div
              key={ach.id}
              style={{
                background: ach.unlocked ? "#fff" : "#f5f5f5",
                border: ach.unlocked ? "2px solid #000" : "2px dashed #ccc",
                borderRadius: "12px",
                padding: "15px",
                display: "flex",
                alignItems: "center",
                gap: "15px",
                opacity: ach.unlocked ? 1 : 0.6,
                filter: ach.unlocked ? "none" : "grayscale(100%)",
                transition: "all 0.3s ease"
              }}
            >
              <div style={{ fontSize: "2.5rem" }}>{ach.icon || "🏆"}</div>
              <div>
                <h3 style={{ margin: "0 0 5px 0", fontSize: "1.1rem" }}>{ach.name}</h3>
                <p style={{ margin: "0 0 5px 0", fontSize: "0.85rem", color: "#666" }}>{ach.description}</p>
                <span style={{
                  background: ach.unlocked ? "#000" : "#999",
                  color: "#fff",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "0.75rem",
                  fontWeight: "bold"
                }}>
                  {ach.xp_reward} XP
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ marginBottom: "50px" }}>
        <h2>Weekly XP</h2>
        {progressData.length === 0 ? <p>No XP data available yet.</p> : (
            <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '2px solid black' }} />
                <Legend />
                <Line type="monotone" dataKey="weekly_xp" stroke="#4f86f7" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
            </ResponsiveContainer>
        )}
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h2>Focus Minutes</h2>
        {progressData.length === 0 ? <p>No Focus data available yet.</p> : (
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '2px solid black' }} />
                <Legend />
                <Bar dataKey="focus_minutes" fill="#34c759" radius={[4, 4, 0, 0]} />
            </BarChart>
            </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}