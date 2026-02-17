import { useState, useEffect } from "react";
import { createHabit, privateApi } from "../api/api"; // remove updateHabit import
import { fetchHabits, fetchDashboardData } from "../api/api";

export default function CreateHabitModal({ onClose, onCreated, habit, onUpdated }) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [difficulty, setDifficulty] = useState("medium");

  // Prefill fields if editing
  useEffect(() => {
    if (habit) {
      setTitle(habit.habit_title);
      setNotes(habit.habit_notes);
      setDifficulty(habit.habit_difficulty || "medium");
    }
  }, [habit]);

  const submit = async () => {
    try {
      const payload = {
        habit_title: title,
        habit_notes: notes,
        habit_difficulty: difficulty,
        habit_frequency: "daily",
      };

      if (habit && onUpdated) {
        // EDITING: use the DRF HabitViewSet PUT endpoint
        const res = await privateApi.put(`habits/${habit.id}/`, payload);
        // res.data now includes the updated xp_reward
        onUpdated(res.data);
      } else {
        // CREATING
        const res = await createHabit(payload);
        onCreated(res.data);
      }

      // Refresh the dashboard XP after create/update
      await fetchDashboardData();

      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to submit habit");
    }
  };

  return (
    <div style={{ background: "white", padding: 20, width: 300 }}>
      <h3>{habit ? "Edit Habit" : "New Habit"}</h3>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      <button onClick={submit}>{habit ? "Update" : "Create"}</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
