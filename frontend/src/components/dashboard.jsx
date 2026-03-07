import { useEffect, useState } from "react";
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import {
  fetchDashboardData,
  fetchHabits,
  fetchTasks,
  completeHabit,
  deleteHabit,
  deleteTask,
  completeTask,
  toggleSubtask,
  fetchProgressData, fetchAchievements, // Ensure this is exported in your api.js
} from "../api/api";

import CreateHabitModal from "./CreateHabitModal";
import CreateTaskModal from "./CreateTaskModal";
import FocusSession from "./FocusSession.jsx";
import "./dashboard.css";
import MascotOverlay from "./MascotOverlay";

import FocusMascot from "../assets/mascots/FocusMascot.png";
import NutritionMascot from "../assets/mascots/NutritionMascot.png";
import StudyMascot from "../assets/mascots/StudyMascot.png";
import SleepMascot from "../assets/mascots/SleepMascot.png";
import ExerciseMascot from "../assets/mascots/ExerciseMascot.png";
import WavingMascot from "../assets/mascots/WavingMascot.png";
import CheeringMascot from "../assets/mascots/CheeringMascot.png";

// Helper component for the graph to keep logic clean
function MiniProgress() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetchProgressData().then(setData).catch(err => console.error("Graph error:", err));
  }, []);

  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
        <XAxis dataKey="date" tick={{ fontSize: '0.7rem' }} />
        <YAxis hide domain={['auto', 'auto']} />
        <Tooltip
          contentStyle={{ borderRadius: '10px', border: '2px solid #000', fontSize: '12px' }}
        />
        <Line
          type="monotone"
          dataKey="weekly_xp"
          stroke="#4f86f7"
          strokeWidth={3}
          dot={{ r: 4, fill: '#4f86f7' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingHabit, setEditingHabit] = useState(null);
  const [focusKey, setFocusKey] = useState(0);
  const [mascotSrc, setMascotSrc] = useState(null);
  const [mascotMessage, setMascotMessage] = useState("");

  const loadDashboard = async () => {
    try {
      const data = await fetchDashboardData();
      setDashboard(data);
      localStorage.setItem("dashboardData", JSON.stringify(data));
      return data;
    } catch {
      setError("Failed to load dashboard");
    }
  };

  const loadHabits = async () => {
    try {
      const habitData = await fetchHabits();
      setHabits(habitData);
    } catch {
      setError("Failed to load habits");
    }
  };

  const loadTasks = async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch {
      setError("Failed to load tasks");
    }
  };

  useEffect(() => {
    const initLoad = async () => {
      try {
        const [dash, habitsData, tasksData, achData] = await Promise.all([
          fetchDashboardData(),
          fetchHabits(),
          fetchTasks(),
          fetchAchievements()
        ]);

        setDashboard(dash);
        setHabits(habitsData);
        setTasks(tasksData);

        // Achievement Notification Logic
        if (achData.newly_unlocked && achData.newly_unlocked.length > 0) {
          const newUnlocks = achData.achievements.filter(ach =>
            achData.newly_unlocked.includes(ach.name)
          );
          const messages = newUnlocks.map(ach =>
            `🏆 ACHIEVEMENT UNLOCKED: ${ach.name}!\n${ach.description} (+${ach.xp_reward} XP)`
          );
          setMascotSrc(CheeringMascot);
          setMascotMessage(messages.join("\n\n"));
        }
      } catch (err) {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    initLoad();
  }, []);

  const handleCompleteHabit = async (habitId, habitTheme) => {
    try {
      const oldLevel = dashboard.level;
      const updatedHabit = await completeHabit(habitId);
      const updatedDashboard = await loadDashboard();
      const xpEarned = updatedHabit.xp_awarded;

      let mascot, message;
      switch (habitTheme) {
        case "studies": mascot = StudyMascot; message = `Study streak continues! 📚 +${xpEarned} XP`; break;
        case "nutrition": mascot = NutritionMascot; message = `Healthy choice! 🥗 +${xpEarned} XP`; break;
        case "sleep": mascot = SleepMascot; message = `Rest well earned 😴 +${xpEarned} XP`; break;
        case "exercise": mascot = ExerciseMascot; message = `Workout complete! 💪 +${xpEarned} XP`; break;
        default: mascot = WavingMascot; message = `Habit completed! +${xpEarned} XP`;
      }

      if (updatedDashboard.level > oldLevel) {
        mascot = CheeringMascot;
        message = `LEVEL UP! 🎉 You reached level ${updatedDashboard.level}! +${xpEarned} XP`;
      }
      setMascotSrc(mascot);
      setMascotMessage(message);
      setHabits((prev) => prev.map((h) => h.id === habitId ? { ...h, is_completed: true, streak: updatedHabit.streak } : h));
    } catch {
      alert("Could not complete habit");
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm("Are you sure you want to delete this habit?")) return;
    try {
      await deleteHabit(habitId);
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
    } catch {
      alert("Failed to delete habit");
    }
  };

  if (loading) return <p className="loading">Loading dashboard…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!dashboard) return null;

  return (
    <div className="dashboard">
      {/* TITLE BAR (HEADER) */}
      <div className="dashboard-header">
        <div className="header-user-info" style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#000000' }}>
          <h1>Hey {dashboard.first_name || "there"}</h1>
          {/* Waving Mascot Image */}
          <img
            src={WavingMascot}
            alt="Mascot Waving"
            style={{ width: '50px', height: 'auto' }}
          />
          <div className="xp-badge-inline">
             Level {dashboard.level} • {dashboard.current_level_xp}/{dashboard.xp_for_next_level} XP
          </div>
        </div>
        <p className="motivation">
          I am motivated by {dashboard.motivation || "No motivation set yet"}
        </p>
      </div>

      <div className="dashboard-layout-container">

        {/* LEFT COLUMN */}
        <div className="dashboard-left-col">

          {/* TOP LEFT: METRICS GRAPH */}
          <div className="dashboard-card metrics-box">
            <h2 className="section-title">Weekly Progress (XP)</h2>
            <MiniProgress />
          </div>

          {/* BOTTOM LEFT ROW: TASKS & FOCUS */}
          <div className="dashboard-bottom-left-row">

            {/* TASKS LOGIC DIV */}
            <div className="dashboard-card tasks-mini-section" style={{ display: 'flex', flexDirection: 'column', maxHeight: '300px' }}>
              <div className="section-header">
                <h2 className="section-title">Tasks</h2>
                <button className="add-btn-small" onClick={() => setShowTaskModal(true)}>+</button>
              </div>
              <div className="scroll-container" style={{overflowY: 'auto', maxHeight: '300px',}}
>
                {tasks.length === 0 && <p className="empty">No tasks yet.</p>}
                {tasks.map((task) => (
                  <div key={task.id} className={`task-card ${task.is_completed ? "completed" : ""}`}>
                    <div className="task-info">
                      <h3>{task.task_title}</h3>

                      {/* SUBTASKS CONTAINER */}
                      <div className="task-sub-info" style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '8px' }}>
                        {task.subtasks.map((sub) => (
                          <label key={sub.id} className="subtask-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <input
                              type="checkbox"
                              checked={sub.is_completed}
                              style={{ cursor: 'pointer' }}
                              onChange={async () => {
                                try {
                                  const updated = await toggleSubtask(sub.id);
                                  setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, subtasks: t.subtasks.map((s) => s.id === sub.id ? { ...s, is_completed: updated.is_completed } : s) } : t));
                                } catch { alert("Failed to toggle subtask"); }
                              }}
                            />
                            <span style={{ textDecoration: sub.is_completed ? 'line-through' : 'none', color: sub.is_completed ? '#888' : 'inherit' }}>
                              {sub.description}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="task-btns">
                      <button className="complete-btn-small" disabled={task.is_completed} onClick={async () => {
                        try {
                          const oldLevel = dashboard.level;
                          const updatedTask = await completeTask(task.id);
                          const updatedDashboard = await loadDashboard();
                          const xpEarned = updatedTask.xp_awarded || 0;
                          setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, is_completed: true, subtasks: t.subtasks.map((s) => ({ ...s, is_completed: true })) } : t));

                          let mascot; let message;
                          switch (task.task_theme) {
                            case "studies": mascot = StudyMascot; message = `Study task complete! 📚 +${xpEarned} XP`; break;
                            case "nutrition": mascot = NutritionMascot; message = `Healthy task done! 🥗 +${xpEarned} XP`; break;
                            case "sleep": mascot = SleepMascot; message = `Rest task complete 😴 +${xpEarned} XP`; break;
                            case "exercise": mascot = ExerciseMascot; message = `Workout task done 💪 +${xpEarned} XP`; break;
                            default: mascot = StudyMascot; message = `Task completed! +${xpEarned} XP`;
                          }
                          if (updatedDashboard.level > oldLevel) { mascot = CheeringMascot; message = `LEVEL UP! 🎉 You reached level ${updatedDashboard.level}! +${xpEarned} XP`; }
                          setMascotSrc(mascot); setMascotMessage(message);
                        } catch { alert("Failed to complete task"); }
                      }}>✓</button>
                      <button className="delete-btn-small" onClick={async () => {
                        if (window.confirm("Delete?")) { await deleteTask(task.id); loadTasks(); }
                      }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FOCUS LOGIC DIV */}
            <div className="dashboard-card focus-mini-section">
              <h2 className="section-title">Focus Session</h2>
              <FocusSession
                key={focusKey}
                onExit={() => setFocusKey(k => k + 1)}
                motivation={dashboard.motivation}
                onComplete={async (xpFromBackend) => {
                  const updated = await loadDashboard();
                  setMascotSrc(updated.level > dashboard.level ? CheeringMascot : FocusMascot);
                  setMascotMessage(updated.level > dashboard.level ? `LEVEL UP! 🎉 Level ${updated.level}!` : `Great focus session! +${xpFromBackend} XP 🧠`);
                }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HABITS (Taking up half) */}
        <div className="dashboard-right-col">
            <div className="habits-section full-height" style={{ display: 'flex', flexDirection: 'column', maxHeight: '600px' }}>
            <div className="section-header">
              <h2>Your Habits</h2>
              <button className="add-btn-main" onClick={() => setShowCreateModal(true)}>+ New Habit</button>
            </div>

            <div className="habits-scroll" style={{overflowY: 'auto', flex: 1, paddingRight: '4px',}}>
              {habits.length === 0 && <p className="empty">No habits yet.</p>}
              {habits.map((habit) => (
                <div key={habit.id} className={`habit-card ${habit.is_completed ? "completed" : ""}`} style={{ borderLeft: `5px solid ${habit.habit_theme === "studies" ? "#4f86f7" : habit.habit_theme === "exercise" ? "#34c759" : habit.habit_theme === "sleep" ? "#d33f3f" : habit.habit_theme === "nutrition" ? "#ff9500" : "#ccc"}` }}>
                  <div className="habit-info">
                    <h3>{habit.habit_title} {habit.current_streak > 0 && <span> | {habit.current_streak}🔥</span>}</h3>
                    {habit.habit_notes && <p className="notes">{habit.habit_notes}</p>}
                  </div>
                  <div className="habit-actions">
                    <button className="complete-btn" disabled={habit.is_completed} onClick={() => handleCompleteHabit(habit.id, habit.habit_theme)}>
                      {habit.is_completed ? "✓" : "Complete"}
                    </button>
                    <button className="edit-btn" onClick={() => { setEditingHabit(habit); setShowCreateModal(true); }}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDeleteHabit(habit.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showCreateModal && (
        <CreateHabitModal
          habit={editingHabit}
          onClose={() => { setShowCreateModal(false); setEditingHabit(null); }}
          onCreated={() => { setShowCreateModal(false); loadHabits(); }}
          onUpdated={(updatedHabit) => { setHabits((prev) => prev.map((h) => (h.id === updatedHabit.id ? updatedHabit : h))); setShowCreateModal(false); }}
        />
      )}
      {showTaskModal && (
        <CreateTaskModal onClose={() => setShowTaskModal(false)} onCreated={() => { setShowTaskModal(false); loadTasks(); }} />
      )}
      {mascotSrc && (
        <MascotOverlay key={Date.now()} src={mascotSrc} message={mascotMessage} onClose={() => setMascotSrc(null)} />
      )}
    </div>
  );
}

export default Dashboard;