import { useEffect, useState } from "react";
import {
  fetchDashboardData,
  fetchHabits,
  fetchTasks,
  completeHabit,
  deleteHabit,
  deleteTask,
  completeTask,
  toggleSubtask,
} from "../api/api";

import CreateHabitModal from "./CreateHabitModal";
import CreateTaskModal from "./CreateTaskModal";
import "./dashboard.css";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    try {
      const data = await fetchDashboardData();
      setDashboard(data);
      localStorage.setItem("dashboardData", JSON.stringify(data));
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
    Promise.all([loadDashboard(), loadHabits(), loadTasks()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const handleCompleteHabit = async (habitId) => {
    try {
      await completeHabit(habitId);
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId ? { ...h, is_completed: true } : h
        )
      );
      loadDashboard();
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
      {/* HEADER */}
      <div className="dashboard-header">
        <h1>Hi {dashboard.first_name || "there"} 👋</h1>
        <p className="motivation">
          {dashboard.motivation || "No motivation set yet"}
        </p>
      </div>

      {/* XP / LEVEL */}
      <div className="xp-card">
        <p className="level">Level {dashboard.level}</p>
        <p className="xp">
          XP: {dashboard.current_level_xp} / {dashboard.xp_for_next_level}
        </p>
        <p className="total-xp">Total XP: {dashboard.total_xp}</p>
      </div>

      {/* HABITS */}
      <div className="habits-section">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>Your Habits</h2>
          <button onClick={() => setShowCreateModal(true)}>+ New Habit</button>
        </div>

        {habits.length === 0 && (
          <div className="empty">
            <p>No habits yet.</p>
            <button onClick={() => setShowCreateModal(true)}>
              Add your first habit
            </button>
          </div>
        )}

        {habits.map((habit) => (
          <div
            key={habit.id}
            className={`habit-card ${habit.is_completed ? "completed" : ""}`}
          >
            <div className="habit-info">
              <h3>{habit.habit_title}</h3>
              {habit.habit_notes && <p className="notes">{habit.habit_notes}</p>}
              <span className="difficulty">Difficulty: {habit.habit_difficulty}</span>
              <span className="xp-reward">+{habit.xp_reward} XP</span>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="complete-btn"
                disabled={habit.is_completed}
                onClick={() => handleCompleteHabit(habit.id)}
              >
                {habit.is_completed ? "Completed" : "Complete"}
              </button>
              <button className="delete-btn" onClick={() => handleDeleteHabit(habit.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE HABIT MODAL */}
      {showCreateModal && (
        <CreateHabitModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadHabits();
          }}
        />
      )}

      {/* TASKS */}
      <div className="tasks-section">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>Your Tasks</h2>
          <button onClick={() => setShowTaskModal(true)}>+ New Task</button>
        </div>

        {tasks.length === 0 && (
          <div className="empty">
            <p>No tasks yet.</p>
            <button onClick={() => setShowTaskModal(true)}>
              Add your first task
            </button>
          </div>
        )}

        {tasks.map((task) => (
          <div
            key={task.id}
            className={`task-card ${task.is_completed ? "completed" : ""}`}
          >
            <div className="task-info">
              <h3>{task.task_title}</h3>
              {task.task_notes && <p>{task.task_notes}</p>}
              {task.due_date && (
                <p>Due: {new Date(task.due_date).toLocaleDateString()}</p>
              )}
              {task.deadline && (
                <p>Deadline: {new Date(task.deadline).toLocaleString()}</p>
              )}
              <span className="difficulty">Difficulty: {task.task_difficulty}</span>
              <span className="xp-reward">+{task.xp_reward} XP</span>

              {/* SUBTASKS */}
              {task.subtasks.map((sub) => (
                <div key={sub.id} style={{ marginLeft: "15px" }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={sub.is_completed}
                      onChange={async () => {
                        try {
                          const updated = await toggleSubtask(sub.id);
                          setTasks((prev) =>
                            prev.map((t) =>
                              t.id === task.id
                                ? {
                                    ...t,
                                    subtasks: t.subtasks.map((s) =>
                                      s.id === sub.id
                                        ? { ...s, is_completed: updated.is_completed }
                                        : s
                                    ),
                                  }
                                : t
                            )
                          );
                        } catch {
                          alert("Failed to toggle subtask");
                        }
                      }}
                    />{" "}
                    {sub.description}
                  </label>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="complete-btn"
                disabled={task.is_completed}
                onClick={async () => {
                  try {
                    await completeTask(task.id);
                    setTasks((prev) =>
                      prev.map((t) =>
                        t.id === task.id
                          ? {
                              ...t,
                              is_completed: true,
                              subtasks: t.subtasks.map((s) => ({
                                ...s,
                                is_completed: true,
                              })),
                            }
                          : t
                      )
                    );
                    loadDashboard();
                  } catch {
                    alert("Failed to complete task");
                  }
                }}
              >
                {task.is_completed ? "Completed" : "Complete"}
              </button>

              <button
                className="delete-btn"
                onClick={async () => {
                  if (!window.confirm("Delete this task?")) return;
                  try {
                    await deleteTask(task.id);
                    setTasks((prev) => prev.filter((t) => t.id !== task.id));
                  } catch {
                    alert("Failed to delete task");
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* CREATE TASK MODAL */}
        {showTaskModal && (
          <CreateTaskModal
            onClose={() => setShowTaskModal(false)}
            onCreated={() => {
              setShowTaskModal(false);
              loadTasks();
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
