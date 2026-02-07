import { useState } from "react";
import { createHabit } from "../api/api";

export default function CreateHabitModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [difficulty, setDifficulty] = useState("medium");

  const submit = async () => {
    await createHabit({
      habit_title: title,
      habit_notes: notes,
      habit_difficulty: difficulty,
      habit_frequency: "daily",
    });
    onCreated();
  };

  return (
    <div style={{ background: "white", padding: 20, width: 300 }}>
      <h3>New Habit</h3>

      <input placeholder="Title" onChange={e => setTitle(e.target.value)} />
      <textarea placeholder="Notes" onChange={e => setNotes(e.target.value)} />

        <select
          value={difficulty}            // <-- bind the value to state
          onChange={e => setDifficulty(e.target.value)}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

      <button onClick={submit}>Create</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
