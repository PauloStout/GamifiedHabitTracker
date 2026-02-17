import { useState, useEffect } from "react";
import { createHabit, privateApi } from "../api/api"; // remove updateHabit import
import { fetchHabits, fetchDashboardData } from "../api/api";

export default function CreateHabitModal({ onClose, onCreated, habit, onUpdated }) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const THEME_CHOICES = [
  { value: "studies", label: "Studies" },
  { value: "exercise", label: "Exercise" },
  { value: "sleep", label: "Sleep" },
  { value: "nutrition", label: "Nutrition" },
  ];
  const [theme, setTheme] = useState("studies"); // default
  const HABIT_PRESETS = {
  studies: [
    {
      title: "1 Hour Deep Study",
      notes: "Focused, distraction-free study session",
      difficulty: "medium",
    },
    {
      title: "Review Flashcards",
      notes: "Spaced repetition session",
      difficulty: "easy",
    },
    {
      title: "Past Paper Practice",
      notes: "Timed exam-style questions",
      difficulty: "hard",
    },
  ],
  exercise: [
    {
      title: "30 Min Workout",
      notes: "Strength or cardio session",
      difficulty: "medium",
    },
    {
      title: "10k Steps",
      notes: "Daily walking goal",
      difficulty: "easy",
    },
    {
      title: "Stretching Session",
      notes: "Mobility & flexibility",
      difficulty: "easy",
    },
  ],
  sleep: [
    {
      title: "Sleep Before 11PM",
      notes: "No screens 30 min before bed",
      difficulty: "medium",
    },
    {
      title: "8 Hours Sleep",
      notes: "Track full rest cycle",
      difficulty: "medium",
    },
  ],
  nutrition: [
    {
      title: "Drink 2L Water",
      notes: "Hydration goal",
      difficulty: "easy",
    },
    {
      title: "No Junk Food",
      notes: "Clean eating day",
      difficulty: "hard",
    },
    {
      title: "Eat my 5 a day",
      notes: "Balanced nutrition focus",
      difficulty: "medium",
    },
  ],
};


useEffect(() => {
  if (habit) {
    setTitle(habit.habit_title);
    setNotes(habit.habit_notes);
    setDifficulty(habit.habit_difficulty || "medium");
    setTheme(habit.habit_theme || "studies");
  }
}, [habit]);

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
        habit_theme: theme,
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
      <label>Theme:</label>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        {THEME_CHOICES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

        <label>Choose Preset:</label>
        <select
          onChange={(e) => {
            const presetIndex = e.target.value;
            if (presetIndex === "") return;

            const preset = HABIT_PRESETS[theme][presetIndex];

            setTitle(preset.title);
            setNotes(preset.notes);
            setDifficulty(preset.difficulty);
          }}
        >
          <option value="">-- Select a preset --</option>
          {HABIT_PRESETS[theme].map((preset, index) => (
            <option key={index} value={index}>
              {preset.title}
            </option>
          ))}
        </select>

    </div>
  );
}
