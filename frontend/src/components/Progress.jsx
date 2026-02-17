// Progress.jsx
import React, { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from "recharts";
import { fetchProgressData } from "../api/api";

export default function Progress() {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user progress data (weekly XP, focus minutes, streaks)
  const fetchProgress = async () => {
    try {
      const data = await fetchProgressData();
      setProgressData(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load progress. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  if (loading) return <p>Loading progress...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!progressData.length) return <p>No progress data available.</p>;

  return (
    <div style={{ padding: "20px", paddingBottom: "80px" }}>
      <h1 style={{ marginBottom: "20px" }}>Your Progress</h1>

      {/* Weekly XP */}
      <div style={{ marginBottom: "40px" }}>
        <h2>Weekly XP</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="weekly_xp" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Focus Minutes */}
      <div style={{ marginBottom: "40px" }}>
        <h2>Focus Minutes</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="focus_minutes" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}