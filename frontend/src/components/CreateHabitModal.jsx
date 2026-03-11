import { useState, useEffect } from "react";
import { createHabit, privateApi, fetchDashboardData } from "../api/api";
import "./Modal.css";

const THEME_CHOICES = [
  { value: "studies", label: "Studies" },
  { value: "exercise", label: "Exercise" },
  { value: "sleep", label: "Sleep" },
  { value: "nutrition", label: "Nutrition" },
];

const HABIT_PRESETS = {
  studies: [
    { title: "1 Hour Deep Study", notes: "Focused, distraction-free study session", difficulty: "medium" },
    { title: "Review Flashcards", notes: "Spaced repetition session", difficulty: "easy" },
    { title: "Past Paper Practice", notes: "Timed exam-style questions", difficulty: "hard" },
  ],
  exercise: [
    { title: "30 Min Workout", notes: "Strength or cardio session", difficulty: "medium" },
    { title: "10k Steps", notes: "Daily walking goal", difficulty: "easy" },
    { title: "Stretching Session", notes: "Mobility & flexibility", difficulty: "easy" },
  ],
  sleep: [
    { title: "Sleep Before 11PM", notes: "No screens 30 min before bed", difficulty: "medium" },
    { title: "8 Hours Sleep", notes: "Track full rest cycle", difficulty: "medium" },
  ],
  nutrition: [
    { title: "Drink 2L Water", notes: "Hydration goal", difficulty: "easy" },
    { title: "No Junk Food", notes: "Clean eating day", difficulty: "hard" },
    { title: "Eat my 5 a day", notes: "Balanced nutrition focus", difficulty: "medium" },
  ],
};

export default function CreateHabitModal({ onClose, onCreated, habit, onUpdated }) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [theme, setTheme] = useState("studies");

  useEffect(() => {
    if (habit) {
      setTitle(habit.habit_title);
      setNotes(habit.habit_notes);
      setDifficulty(habit.habit_difficulty || "medium");
      setTheme(habit.habit_theme || "studies");
    }
  }, [habit]);

  //CreateHabitModal.jsx
  const submit = async () => {
    try {
      const payload = {habit_title: title, habit_notes: notes, habit_difficulty: difficulty, habit_frequency: "daily", habit_theme: theme,};

      if (habit && onUpdated) {
        const res = await privateApi.put(`habits/${habit.id}/`, payload);
        onUpdated(res.data);
      } else {
        const res = await createHabit(payload);
        onCreated(res.data);
      }

      await fetchDashboardData();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to submit habit");
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{habit ? "Edit Habit" : "Edit / Create Habit"}</h3>
        </div>

        <div className="modal-body">
          <label className="modal-label">Title</label>
          <input
            className="modal-input"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="modal-label">Notes</label>
          <textarea
            className="modal-textarea"
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <label className="modal-label">Difficulty</label>
          <select
            className="modal-select"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="easy">Easy ⭐</option>
            <option value="medium">Medium ⭐⭐</option>
            <option value="hard">Hard ⭐⭐⭐</option>
          </select>

          <label className="modal-label">Theme</label>
          <select
            className="modal-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            {THEME_CHOICES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <div className="preset-section">
            <label className="modal-label">Choose Preset</label>
            <select
              className="modal-select"
              onChange={(e) => {
                const idx = e.target.value;
                if (idx === "") return;
                const preset = HABIT_PRESETS[theme][idx];
                setTitle(preset.title);
                setNotes(preset.notes);
                setDifficulty(preset.difficulty);
              }}
            >
              <option value="">-- Select a preset --</option>
              {HABIT_PRESETS[theme].map((preset, index) => (
                <option key={index} value={index}>{preset.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="modal-save-btn" onClick={submit}>Save</button>
        </div>
      </div>
    </div>
  );
}